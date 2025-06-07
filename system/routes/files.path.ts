import path from "node:path"
import { DocEngine } from "@/lib/docs-engine/doc-engine"
import { factory } from "@/lib/factory"
import { zAppFile, zAppFileProperties } from "@/lib/models"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import { zValidator } from "@hono/zod-validator"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"

/**
 * ファイルコンテンツを取得する
 * @param path ファイルパス
 * @returns ファイル情報とコンテンツ
 */
export const GET = factory.createHandlers(async (c) => {
  const rawPath = c.req.param("path")

  if (rawPath === undefined) {
    throw new HTTPException(400, {})
  }

  // パスを正規化（絶対パスから相対パスに変換）
  let currentPath = rawPath

  // 絶対パスの場合、相対パスに変換
  if (currentPath.includes("/docs/")) {
    const docsIndex = currentPath.lastIndexOf("/docs/")
    currentPath = currentPath.substring(docsIndex + 6) // '/docs/'.length = 6
  }

  // docsプレフィックスを削除
  currentPath = currentPath.replace(/^docs\//, "")

  // 先頭のスラッシュを削除
  currentPath = currentPath.replace(/^\/+/, "")

  const docsEngine = new DocEngine({
    basePath: path.join(process.cwd(), "docs"),
  })

  const exists = await docsEngine.exists(currentPath)

  if (!exists) {
    throw new HTTPException(400, {})
  }

  const docFile = await docsEngine.getFile(currentPath)
  const markdownContent = await docsEngine.readFileContent(currentPath)

  const openMarkdownInstance = new OpenMarkdown(markdownContent)
  let frontMatter = openMarkdownInstance.frontMatter.data || {}

  // ディレクトリのindex.mdのスキーマからデフォルト値を取得し、欠けているフィールドを補完
  const directoryPath = path.dirname(currentPath)
  try {
    const directoryData = await docsEngine.getDirectory(directoryPath)
    const schema = directoryData.schema

    // スキーマに基づいてデフォルト値を生成し、既存のFrontMatterとマージ
    const defaultFrontMatter: Record<string, unknown> = {}
    for (const [key, field] of Object.entries(schema)) {
      if (field.type === "string") {
        defaultFrontMatter[key] = ""
      } else if (field.type === "boolean") {
        defaultFrontMatter[key] = false
      } else if (field.type === "number") {
        defaultFrontMatter[key] = 0
      } else if (field.type === "array-string") {
        defaultFrontMatter[key] = []
      }
    }

    // デフォルト値と既存の値をマージ（既存の値を優先）
    frontMatter = { ...defaultFrontMatter, ...frontMatter }
  } catch (error) {
    // ディレクトリのindex.mdが見つからない場合は既存のFrontMatterをそのまま使用
  }

  const content = openMarkdownInstance.content

  const response = zAppFile.parse({
    path: `docs/${currentPath}`,
    frontMatter,
    content,
    cwd: process.cwd(),
    title: docFile.title || null,
    description: openMarkdownInstance.description,
  })
  return c.json(response)
})

/**
 * ファイルのプロパティ（フロントマター）またはコンテンツを更新する
 */
export const PUT = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      properties: z.record(z.string(), z.unknown()).nullable(),
      body: z.string().nullable(),
      title: z.string().nullable(),
      description: z.string().nullable(),
    }),
  ),
  async (c) => {
    const body = c.req.valid("json")

    const rawPath = c.req.param("path")

    if (rawPath === undefined) {
      throw new HTTPException(400, { message: "Path parameter is required" })
    }

    const filePath = rawPath

    const docsEngine = new DocEngine({
      basePath: path.join(process.cwd(), "docs"),
    })

    const exists = await docsEngine.exists(filePath)

    // ファイルの存在確認
    if (!exists) {
      throw new HTTPException(404, {
        message: `ファイルが見つかりません: ${filePath}`,
      })
    }

    const markdownContent = await docsEngine.readFileContent(filePath)

    const openMarkdown = new OpenMarkdown(markdownContent)

    // スキーマベースでFrontMatterを補完する共通関数
    const getCompleteFrontMatter = async () => {
      const docFile = await docsEngine.getFile(filePath)
      const directoryPath = path.dirname(filePath)
      const completeFrontMatter = docFile.frontMatter.data || {}

      const directoryExists = await docsEngine.exists(directoryPath)
      if (!directoryExists) {
        return completeFrontMatter
      }

      const directoryData = await docsEngine.getDirectory(directoryPath)
      if (
        !directoryData.schema ||
        Object.keys(directoryData.schema).length === 0
      ) {
        return completeFrontMatter
      }

      const schema = directoryData.schema
      const defaultFrontMatter: Record<string, unknown> = {}
      for (const [key, field] of Object.entries(schema)) {
        if (field.type === "string") {
          defaultFrontMatter[key] = ""
        } else if (field.type === "boolean") {
          defaultFrontMatter[key] = false
        } else if (field.type === "number") {
          defaultFrontMatter[key] = 0
        } else if (field.type === "array-string") {
          defaultFrontMatter[key] = []
        }
      }

      return { ...defaultFrontMatter, ...completeFrontMatter }
    }

    if (body.properties) {
      // properties更新の場合もスキーマベースで補完されたFrontMatterを使用
      const completeFrontMatter = await getCompleteFrontMatter()

      const draftFrontMatter: Record<string, unknown> = {
        ...completeFrontMatter,
        ...body.properties,
      }

      // undefinedの値を削除
      for (const key of Object.keys(draftFrontMatter)) {
        if (draftFrontMatter[key] === undefined) {
          delete draftFrontMatter[key]
        }
      }

      const draft = openMarkdown.withFrontMatter(draftFrontMatter).text

      await docsEngine.writeFileContent(filePath, draft)

      const response = zAppFileProperties.parse({
        success: true,
        frontMatter: draftFrontMatter,
      })

      return c.json(response)
    }

    if (body.title) {
      // タイトル更新の場合はH1を更新しつつFrontMatterを保持
      const completeFrontMatter = await getCompleteFrontMatter()

      // 完全なMarkdownを構築してからタイトル更新
      const fullMarkdown = OpenMarkdown.fromProps({
        frontMatter: completeFrontMatter,
        content: openMarkdown.content,
      })

      const updatedMarkdown = fullMarkdown.withTitle(body.title)

      await docsEngine.writeFileContent(filePath, updatedMarkdown.text)

      const response = zAppFileProperties.parse({
        success: true,
        frontMatter: completeFrontMatter,
      })

      return c.json(response)
    }

    if (body.description !== null && body.description !== undefined) {
      // description更新の場合はH1の次の段落を更新しつつFrontMatterを保持
      const completeFrontMatter = await getCompleteFrontMatter()

      // H1がない場合のデフォルトタイトルを取得（ファイル名から）
      const fileName = path.basename(filePath, ".md")
      const defaultTitle = fileName === "index" ? "概要" : fileName

      // 完全なMarkdownを構築してからdescription更新
      const fullMarkdown = OpenMarkdown.fromProps({
        frontMatter: completeFrontMatter,
        content: openMarkdown.content,
      })

      const updatedMarkdown = fullMarkdown.withDescription(
        body.description,
        defaultTitle,
      )

      await docsEngine.writeFileContent(filePath, updatedMarkdown.text)

      const response = zAppFileProperties.parse({
        success: true,
        frontMatter: completeFrontMatter,
      })

      return c.json(response)
    }

    if (body.body) {
      // body更新の場合もFrontMatterを保持
      const completeFrontMatter = await getCompleteFrontMatter()

      // 新しいbodyから既存のFrontMatterを抽出して、補完されたFrontMatterと結合
      const newOpenMarkdown = new OpenMarkdown(body.body)
      const existingBodyFrontMatter = newOpenMarkdown.frontMatter.data || {}
      const mergedFrontMatter = {
        ...completeFrontMatter,
        ...existingBodyFrontMatter,
      }

      // 完全なMarkdownを構築
      const fullMarkdown = OpenMarkdown.fromProps({
        frontMatter: mergedFrontMatter,
        content: newOpenMarkdown.content,
      })

      await docsEngine.writeFileContent(filePath, fullMarkdown.text)

      const response = zAppFileProperties.parse({
        success: true,
        frontMatter: mergedFrontMatter,
      })

      return c.json(response)
    }

    throw new HTTPException(400, {
      message: `Invalid request: properties=${!!body.properties}, body=${!!body.body}, title=${!!body.title}, description=${!!body.description}`,
    })
  },
)
