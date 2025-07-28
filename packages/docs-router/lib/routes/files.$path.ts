import { zValidator } from "@hono/zod-validator"
import { HTTPException } from "hono/http-exception"
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

    // pathパラメータが文字列であることを確認
    if (!rawPath || typeof rawPath !== "string") {
      throw new HTTPException(400, {
        message: "Path parameter is required and must be a string",
      })
    }

    const filePath = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath

    const file = c.var.client.mdFile(filePath)

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

    const fileRef = c.var.client.mdFile(filePath)

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
      const indexFileRef = c.var.client.file(filePath).directory().indexFile()
      const indexFile = await indexFileRef.read()
      if (indexFile instanceof Error) {
        throw new HTTPException(500, {
          message: `Index file not found or error reading: ${indexFile.message}`,
        })
      }
      let updatedContent = file.content
      for (const [key, value] of Object.entries(body.properties)) {
        updatedContent = updatedContent.withMetaProperty(key, value as any)
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
    } else {
      // propertiesがない場合でも他の更新を処理
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
    }

    // ファイルを書き込み
    await fileRef.write(file)

    return c.json(file.toJson())
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

    // pathパラメータが文字列であることを確認
    if (!rawPath || typeof rawPath !== "string") {
      throw new HTTPException(400, {
        message: "Path parameter is required and must be a string",
      })
    }

    const filePath = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath

    const fileRef = c.var.client.mdFile(filePath)

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
