import * as path from "node:path"
import { DocsEngine } from "@/lib/docs-engine/docs-engine"
import { factory } from "@/lib/factory"
import { zAppFileMove } from "@/lib/models"
import { zValidator } from "@hono/zod-validator"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { validateDocsPath } from "../utils"

const moveFileSchema = z.object({
  sourcePath: z.string(),
  destinationPath: z.string(),
})

/**
 * ファイルまたはディレクトリを移動する
 * @param sourcePath 移動元パス
 * @param destinationPath 移動先パス
 * @returns 移動結果
 */
export const POST = factory.createHandlers(
  zValidator("json", moveFileSchema),
  async (c) => {
    const body = c.req.valid("json")

    const sourceFullPath = validateDocsPath(body.sourcePath)
    const destinationFullPath = validateDocsPath(body.destinationPath)

    const docsPath = path.join(process.cwd(), "docs")
    const sourceRelativePath = path.relative(docsPath, sourceFullPath)
    const destinationRelativePath = path.relative(docsPath, destinationFullPath)

    const docsEngine = new DocsEngine({
      basePath: docsPath,
    })

    // 移動元が存在するか確認
    if (!(await docsEngine.exists(sourceRelativePath))) {
      const errorResponse = zAppFileMove.parse({
        success: false,
        message: `移動元が存在しません: ${body.sourcePath}`,
      })
      return c.json(errorResponse, 404)
    }

    // 移動先に同名のファイルが存在するか確認
    if (await docsEngine.exists(destinationRelativePath)) {
      const errorResponse = zAppFileMove.parse({
        success: false,
        message: `移動先に同名のファイルが既に存在します: ${body.destinationPath}`,
      })
      return c.json(errorResponse, 409)
    }

    const isDirectory = await docsEngine.isDirectory(sourceRelativePath)

    // 現在の実装では基本的なファイル移動のみサポート
    const sourceFile = docsEngine.file(sourceRelativePath)
    const destinationFile = docsEngine.file(destinationRelativePath)

    if (!isDirectory) {
      const content = await sourceFile.readContent()
      await destinationFile.writeContent(content)
      await sourceFile.delete()
    } else {
      throw new HTTPException(500, {
        message: "ディレクトリの移動は現在サポートされていません",
      })
    }

    const response = zAppFileMove.parse({
      success: true,
      message: `${isDirectory ? "ディレクトリ" : "ファイル"}を移動しました: ${body.sourcePath} -> ${body.destinationPath}`,
    })
    return c.json(response)
  },
)
