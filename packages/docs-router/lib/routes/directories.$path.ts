import { zValidator } from "@hono/zod-validator"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { zDirectoryJson } from "@/models"
import { cwd } from "@/utils/cwd"
import { factory } from "@/utils/factory"

/**
 * GET /api/directories/:path - ディレクトリデータ取得（ディレクトリ専用）
 */
export const GET = factory.createHandlers(
  zValidator("param", z.object({ path: z.string().optional() })),
  async (c) => {
    const param = c.req.valid("param")

    const rawPath = param.path

    const currentPath = rawPath && typeof rawPath === "string" ? rawPath : ""

    if (currentPath === "/") {
      throw new HTTPException(400, { message: "パスが無効です。" })
    }

    const directory = c.var.client.directory(currentPath)

    const files = await directory.readFiles()

    const indexFile = await directory.indexFile().read()

    const relations = await directory.indexFile().readRelations()

    const json = zDirectoryJson.parse({
      cwd: cwd(),
      files: files.map((file) => file.toJson()) as never,
      indexFile: indexFile.toJson(),
      relations: relations.map((relation) => {
        return relation.toJson()
      }),
    } satisfies z.infer<typeof zDirectoryJson>)

    return c.json(json)
  },
)

/**
 * ディレクトリのプロパティ（index.mdのフロントマター）を更新する
 */
export const PUT = factory.createHandlers(
  zValidator("param", z.object({ path: z.string().nullable() })),
  zValidator(
    "json",
    z.object({
      title: z.string().nullable(),
      description: z.string().nullable(),
      icon: z.string().nullable(),
      schema: z.record(z.string(), z.unknown()).nullable(),
    }),
  ),
  async (c) => {
    const body = c.req.valid("json")

    const param = c.req.valid("param")

    const rawPath = param.path

    let directoryPath = rawPath && typeof rawPath === "string" ? rawPath : ""

    // "/" を空文字列に正規化（ルートディレクトリの場合）
    if (directoryPath === "/") {
      directoryPath = ""
    }

    const directoryRef = c.var.client.directory(directoryPath)

    const indexFileRef = directoryRef.indexFile()

    const exists = await indexFileRef.exists()

    if (!exists) {
      throw new HTTPException(404, {
        message: `ディレクトリのindex.mdが見つかりません: ${directoryPath}/index.md`,
      })
    }

    let indexFile = await indexFileRef.read()

    if (indexFile instanceof Error) {
      throw new HTTPException(500, {
        message: indexFile.message,
      })
    }

    let content = indexFile.content

    if (body.icon !== null || body.schema !== null) {
      let meta = content.meta()

      if (body.icon !== null) {
        meta = meta.withIcon(body.icon)
      }

      if (body.schema !== null) {
        meta = meta.withUnknownSchema(body.schema)
      }

      content = content.withMeta(meta.value)
    }

    if (body.title !== null) {
      content = content.withTitle(body.title)
    }

    if (body.description !== null) {
      content = content.withDescription(body.description)
    }

    indexFile = indexFile.withContent(content)

    await indexFileRef.write(indexFile)

    const files = await directoryRef.readFiles()

    const relations = await indexFileRef.readRelations()

    const json = zDirectoryJson.parse({
      cwd: cwd(),
      files: files.map((file) => file.toJson()) as never,
      indexFile: indexFile.toJson(),
      relations: relations.map((relation) => {
        return relation.toJson()
      }),
    } satisfies z.infer<typeof zDirectoryJson>)

    return c.json(json)
  },
)
