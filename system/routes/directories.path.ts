import path from "node:path"
import { DocsEngine } from "@/lib/docs-engine/docs-engine"
import { factory } from "@/lib/factory"
import { zAppDirectory } from "@/lib/models"
import { HTTPException } from "hono/http-exception"

/**
 * GET /api/:path - ディレクトリまたはファイルデータ取得
 */
export const GET = factory.createHandlers(async (c) => {
  const currentPath = c.req.param("path")

  if (currentPath === undefined) {
    throw new HTTPException(400, {
      message: "Path parameter is required",
    })
  }

  const docsPath = "docs"

  const docsEngine = new DocsEngine({
    basePath: path.join(process.cwd(), docsPath),
  })

  const rawData = await docsEngine.getDirectoryData(currentPath)

  const data = zAppDirectory.parse(rawData)

  return c.json(data)
})
