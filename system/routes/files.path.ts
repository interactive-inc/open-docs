import path from "node:path"
import { DocEngine } from "@/lib/engine/doc-engine"
import { factory } from "@/lib/factory"
import { normalizePath } from "@/system/utils/normalize-path"
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

  const currentPath = normalizePath(rawPath)

  const docsEngine = new DocEngine({
    basePath: path.join(process.cwd(), "docs"),
    indexFileName: null,
    readmeFileName: null,
  })

  const exists = await docsEngine.exists(currentPath)

  if (!exists) {
    throw new HTTPException(400, {})
  }

  const response = await docsEngine.readFile(currentPath)

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
      indexFileName: null,
      readmeFileName: null,
    })

    const exists = await docsEngine.exists(filePath)

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

      // 更新後のファイル情報を統一フォーマットで返す
      const response = await docsEngine.readFile(filePath)

      return c.json(response)
    }

    if (body.title) {
      const docFile = await docsEngine.getFile(filePath)

      const draftDocFile = docFile.withTitle(body.title)

      const markdownText = draftDocFile.toMarkdownText()

      await docsEngine.writeFileContent(filePath, markdownText)

      const response = await docsEngine.readFile(filePath)

      return c.json(response)
    }

    if (body.description !== null && body.description !== undefined) {
      const docFile = await docsEngine.getFile(filePath)

      const fileName = path.basename(filePath, ".md")

      const defaultTitle = fileName === "index" ? "概要" : fileName

      const draftDocFile = docFile.withDescription(
        body.description,
        defaultTitle,
      )
      const updatedMarkdown = draftDocFile.toMarkdownText()

      await docsEngine.writeFileContent(filePath, updatedMarkdown)

      const response = await docsEngine.readFile(filePath)

      return c.json(response)
    }

    if (body.body) {
      const docFile = await docsEngine.getFile(filePath)

      const draftFocFile = docFile.withContent(body.body)

      const fullMarkdown = draftFocFile.toMarkdownText()

      await docsEngine.writeFileContent(filePath, fullMarkdown)

      const response = await docsEngine.readFile(filePath)

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
    indexFileName: null,
    readmeFileName: null,
  })

  const filePath = currentPath

  const exists = await docsEngine.exists(filePath)

  if (!exists) {
    throw new HTTPException(404, {
      message: `ファイルが見つかりません: ${filePath}`,
    })
  }

  const isDirectory = await docsEngine.isDirectory(filePath)

  if (isDirectory) {
    throw new HTTPException(400, {
      message: `指定されたパスはディレクトリです: ${filePath}`,
    })
  }

  await docsEngine.deleteFile(filePath)

  return c.json({ success: true })
})
