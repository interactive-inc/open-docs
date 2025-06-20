import path from "node:path"
import { zValidator } from "@hono/zod-validator"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { cwd } from "@/lib/cwd"
import { DocEngine } from "@/lib/engine/doc-engine"
import { factory } from "@/lib/factory"

/**
 * GET /api/directories/:path - ディレクトリデータ取得（ディレクトリ専用）
 */
export const GET = factory.createHandlers(async (c) => {
  const currentPath = c.req.param("path") ?? ""

  const docsPath = "docs"

  // currentPathからdocsプレフィックスを削除
  const relativePath = currentPath.startsWith("docs/")
    ? currentPath.substring(5)
    : currentPath

  const engine = new DocEngine({
    basePath: path.join(cwd(), docsPath),
    indexFileName: null,
    readmeFileName: null,
  })

  const directory = await engine.readDirectory(relativePath)

  return c.json(directory.toJson())
})

/**
 * ディレクトリのプロパティ（index.mdのフロントマター）を更新する
 */
export const PUT = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      properties: z.record(z.string(), z.unknown()).nullable(),
      title: z.string().nullable(),
      description: z.string().nullable(),
    }),
  ),
  async (c) => {
    const body = c.req.valid("json")

    const rawPath = c.req.param("path") ?? ""

    const directoryPath = rawPath

    const docsEngine = new DocEngine({
      basePath: path.join(cwd(), "docs"),
      indexFileName: null,
      readmeFileName: null,
    })

    const exists = await docsEngine.exists(directoryPath)

    if (!exists) {
      throw new HTTPException(404, {
        message: `ディレクトリが見つかりません: ${directoryPath}`,
      })
    }

    // エンジンのupdateIndexFileメソッドを使用
    await docsEngine.updateIndexFile(directoryPath, {
      title: body.title,
      description: body.description,
      properties: body.properties,
    })

    const updatedDirectory = await docsEngine.readDirectory(directoryPath)

    return c.json(updatedDirectory.toJson())
  },
)
