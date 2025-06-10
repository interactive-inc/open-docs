import path from "node:path"
import { DocEngine } from "@/lib/docs-engine/doc-engine"
import { factory } from "@/lib/factory"
import { zAppFile } from "@/system/models/app-file"
import { zAppFileProperties } from "@/system/models/app-file-properties"
import { zValidator } from "@hono/zod-validator"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"

/**
 * パスを正規化（絶対パスから相対パスに変換）
 */
function normalizePath(rawPath: string): string {
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

  return currentPath
}

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

  const currentPath = normalizePath(rawPath)

  const docsEngine = new DocEngine({
    basePath: path.join(process.cwd(), "docs"),
  })

  const exists = await docsEngine.exists(currentPath)

  if (!exists) {
    throw new HTTPException(400, {})
  }

  const docFile = await docsEngine.getFile(currentPath)

  const response = zAppFile.parse({
    path: `docs/${currentPath}`,
    frontMatter: docFile.frontMatter.data,
    content: docFile.content,
    cwd: process.cwd(),
    title: docFile.title || null,
    description: docFile.description,
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

    if (body.properties) {
      const docFile = await docsEngine.getFile(filePath)

      const completeFrontMatter = docFile.frontMatter.data

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

      const updatedDocFile = docFile.withFrontMatter(draftFrontMatter)

      const markdownText = updatedDocFile.toMarkdownText()

      await docsEngine.writeFileContent(filePath, markdownText)

      const response = zAppFileProperties.parse({
        success: true,
        frontMatter: draftFrontMatter,
      })

      return c.json(response)
    }

    if (body.title) {
      const docFile = await docsEngine.getFile(filePath)

      const draftDocFile = docFile.withTitle(body.title)

      const markdownText = draftDocFile.toMarkdownText()

      await docsEngine.writeFileContent(filePath, markdownText)

      const response = zAppFileProperties.parse({
        success: true,
        frontMatter: draftDocFile.frontMatter.data,
      })

      return c.json(response)
    }

    if (body.description !== null && body.description !== undefined) {
      // description更新の場合はH1の次の段落を更新しつつFrontMatterを保持
      const docFile = await docsEngine.getFile(filePath)

      // H1がない場合のデフォルトタイトルを取得（ファイル名から）
      const fileName = path.basename(filePath, ".md")
      const defaultTitle = fileName === "index" ? "概要" : fileName

      const draftDocFile = docFile.withDescription(
        body.description,
        defaultTitle,
      )
      const updatedMarkdown = draftDocFile.toMarkdownText()

      await docsEngine.writeFileContent(filePath, updatedMarkdown)

      const response = zAppFileProperties.parse({
        success: true,
        frontMatter: draftDocFile.frontMatter.data,
      })

      return c.json(response)
    }

    if (body.body) {
      const docFile = await docsEngine.getFile(filePath)

      const draftFocFile = docFile.withContent(body.body)

      const fullMarkdown = draftFocFile.toMarkdownText()

      await docsEngine.writeFileContent(filePath, fullMarkdown)

      const response = zAppFileProperties.parse({
        success: true,
        frontMatter: draftFocFile.frontMatter.data,
      })

      return c.json(response)
    }

    throw new HTTPException(400, {
      message: `Invalid request: properties=${!!body.properties}, body=${!!body.body}, title=${!!body.title}, description=${!!body.description}`,
    })
  },
)

/**
 * ファイルを削除する
 */
export const DELETE = factory.createHandlers(async (c) => {
  const rawPath = c.req.param("path")

  if (rawPath === undefined) {
    throw new HTTPException(400, { message: "Path parameter is missing" })
  }

  const currentPath = normalizePath(rawPath)

  const docsEngine = new DocEngine({
    basePath: path.join(process.cwd(), "docs"),
  })

  const filePath = currentPath

  // ファイルの存在確認
  if (!(await docsEngine.exists(filePath))) {
    throw new HTTPException(404, {
      message: `ファイルが見つかりません: ${filePath}`,
    })
  }

  // ファイルであることを確認
  if (await docsEngine.isDirectory(filePath)) {
    throw new HTTPException(400, {
      message: `指定されたパスはディレクトリです: ${filePath}`,
    })
  }

  // ファイルを削除
  await docsEngine.deleteFile(filePath)

  return c.json({ success: true })
})
