import { zValidator } from "@hono/zod-validator"
import type { DocClient } from "@interactive-inc/docs-client"
import { HTTPException } from "hono/http-exception"
import { nanoid } from "nanoid"
import { z } from "zod"
import { factory } from "../utils/factory"

/**
 * ファイルコンテンツを取得する
 * @param path ファイルパス
 * @returns ファイル情報とコンテンツ
 */
export const GET = factory.createHandlers(
  zValidator("param", z.object({ path: z.string().optional() })),
  async (c) => {
    const param = c.req.valid("param")

    const rawPath = param.path

    if (!rawPath || typeof rawPath !== "string") {
      throw new HTTPException(400, {
        message: "Path parameter is required and must be a string",
      })
    }

    const filePath = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath

    const directoryRef = c.var.client.file(filePath).directory()

    const indexFileRef = directoryRef.indexFile()

    const schema = await indexFileRef.readSchemaValue()

    const file = c.var.client.mdFile(filePath, schema)

    const entity = await file.read()

    if (entity instanceof Error) {
      throw new HTTPException(404, { message: entity.message })
    }

    return c.json(entity.toJson())
  },
)

/**
 * ファイルのプロパティ（フロントマター）またはコンテンツを更新する
 */
export const PUT = factory.createHandlers(
  zValidator("param", z.object({ path: z.string() })),
  zValidator(
    "json",
    z.object({
      properties: z.record(z.string(), z.unknown()).nullable(),
      content: z.string().nullable(),
      title: z.string().nullable(),
      description: z.string().nullable(),
      isArchived: z.boolean().nullable(),
    }),
  ),
  async (c) => {
    const body = c.req.valid("json")

    const param = c.req.valid("param")

    const rawPath = param.path

    // pathパラメータが文字列であることを確認
    if (!rawPath || typeof rawPath !== "string") {
      throw new HTTPException(400, {
        message: "Path parameter is required and must be a string",
      })
    }

    const filePath = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath

    const directoryRef = c.var.client.file(filePath).directory()

    const indexFileRef = directoryRef.indexFile()

    const schema = await indexFileRef.readSchemaValue()

    const fileRef = c.var.client.mdFile(filePath, schema)

    const exists = await fileRef.exists()

    if (!exists) {
      throw new HTTPException(404, {
        message: `ファイルが見つかりません: ${filePath}`,
      })
    }

    if (body.isArchived !== null) {
      if (body.isArchived) {
        const draftFileRef = await fileRef.archive()
        const draftFile = await draftFileRef.read()
        if (draftFile instanceof Error) {
          throw new HTTPException(500, { message: draftFile.message })
        }
        return c.json(draftFile.toJson())
      }
      const draftFileRef = await fileRef.restore()
      const draftFile = await draftFileRef.read()
      if (draftFile instanceof Error) {
        throw new HTTPException(500, { message: draftFile.message })
      }
      return c.json(draftFile.toJson())
    }

    let file = await fileRef.read()

    if (file instanceof Error) {
      throw new HTTPException(500, { message: file.message })
    }

    if (body.properties !== null) {
      let updatedContent = file.content
      for (const [key, value] of Object.entries(body.properties)) {
        updatedContent = updatedContent.withMetaProperty(key, value as never)
      }

      // タイトルを更新
      if (body.title !== null) {
        updatedContent = updatedContent.withTitle(body.title)
      }

      // 説明を更新
      if (body.description !== null) {
        const pathSystem = c.var.client.pathSystem
        const fileName = pathSystem.basename(filePath, ".md")
        const defaultTitle = fileName === "index" ? "概要" : fileName
        updatedContent = updatedContent.withDescription(
          body.description,
          defaultTitle,
        )
      }

      // コンテンツを更新
      if (body.content !== null) {
        updatedContent = updatedContent.withContent(body.content)
      }

      file = file.withContent(updatedContent)

      // ファイルを書き込み
      await fileRef.write(file)

      return c.json(file.toJson())
    }

    let updatedContent = file.content

    // タイトルを更新
    if (body.title !== null) {
      updatedContent = updatedContent.withTitle(body.title)
    }

    // 説明を更新
    if (body.description !== null) {
      const pathSystem = c.var.client.pathSystem
      const fileName = pathSystem.basename(filePath, ".md")
      const defaultTitle = fileName === "index" ? "概要" : fileName
      updatedContent = updatedContent.withDescription(
        body.description,
        defaultTitle,
      )
    }

    // コンテンツを更新
    if (body.content !== null) {
      updatedContent = updatedContent.withContent(body.content)
    }

    file = file.withContent(updatedContent)

    // ファイルを書き込み
    await fileRef.write(file)

    return c.json(file.toJson())
  },
)

/**
 * ファイルを作成する
 */
export const POST = factory.createHandlers(
  zValidator("param", z.object({ path: z.string() })),
  async (c) => {
    const param = c.req.valid("param")

    const rawPath = param.path

    if (!rawPath || typeof rawPath !== "string") {
      throw new HTTPException(400, {
        message: "Path parameter is required and must be a string",
      })
    }

    const dirPath = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath

    // ランダムなファイル名を生成
    const fileName = `${nanoid()}.md`

    const filePath = c.var.client.pathSystem.join(dirPath, fileName)

    await initIndexFile(dirPath, c.var.client)

    const directoryRef = c.var.client.file(filePath).directory()

    const indexFileRef = directoryRef.indexFile()

    const schema = await indexFileRef.readSchemaValue()

    const fileRef = c.var.client.mdFile(filePath, schema)

    // 空のファイルを作成
    const draftFile = fileRef.empty()

    const result = await fileRef.write(draftFile)

    if (result instanceof Error) {
      throw new HTTPException(500, { message: result.message })
    }

    return c.json(draftFile.toJson())
  },
)

/**
 * ファイルを削除する
 */
export const DELETE = factory.createHandlers(
  zValidator("param", z.object({ path: z.string() })),
  async (c) => {
    const param = c.req.valid("param")

    const rawPath = param.path

    if (!rawPath || typeof rawPath !== "string") {
      throw new HTTPException(400, {
        message: "Path parameter is required and must be a string",
      })
    }

    const filePath = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath

    const fileRef = c.var.client.mdFile(filePath, {})

    const exists = await fileRef.exists()

    if (!exists) {
      throw new HTTPException(404, {
        message: `ファイルが見つかりません: ${filePath}`,
      })
    }

    const result = await fileRef.delete()

    if (result instanceof Error) {
      throw new HTTPException(500, { message: result.message })
    }

    return c.json({ success: true })
  },
)

/**
 * ディレクトリのindex.mdを読み取り、存在しなければ作成して返す
 */
async function initIndexFile(dirPath: string, client: DocClient) {
  const mdIndexRef = client.directory(dirPath, {}).indexFile()

  const hasIndex = await mdIndexRef.exists()

  if (hasIndex) {
    const entity = await mdIndexRef.read()
    if (entity instanceof Error) {
      throw new HTTPException(500, { message: entity.message })
    }
    return null
  }

  const indexFile = mdIndexRef.empty()

  const result = await mdIndexRef.write(indexFile)

  if (result instanceof Error) {
    throw new HTTPException(500, { message: result.message })
  }

  return null
}
