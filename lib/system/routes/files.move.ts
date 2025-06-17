import * as path from "node:path"
import { DocEngine } from "@/lib/engine/doc-engine"
import { factory } from "@/lib/system/factory"
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
export const PUT = factory.createHandlers(
  zValidator("json", moveFileSchema),
  async (c) => {
    const body = c.req.valid("json")

    const sourceFullPath = validateDocsPath(body.sourcePath)
    const destinationFullPath = validateDocsPath(body.destinationPath)

    const docsPath = path.join(process.cwd(), "docs")
    const sourceRelativePath = path.relative(docsPath, sourceFullPath)
    const destinationRelativePath = path.relative(docsPath, destinationFullPath)

    const docsEngine = new DocEngine({
      basePath: docsPath,
      indexFileName: null,
      readmeFileName: null,
    })

    // 移動元が存在するか確認
    if (!(await docsEngine.exists(sourceRelativePath))) {
      throw new HTTPException(404, {
        message: `移動元が存在しません: ${body.sourcePath}`,
      })
    }

    // 移動先に同名のファイルが存在するか確認
    if (await docsEngine.exists(destinationRelativePath)) {
      throw new HTTPException(409, {
        message: `移動先に同名のファイルが既に存在します: ${body.destinationPath}`,
      })
    }

    const isDirectory = await docsEngine.isDirectory(sourceRelativePath)

    // 現在の実装では基本的なファイル移動のみサポート
    if (!isDirectory) {
      const content = await docsEngine.readFileContent(sourceRelativePath)
      await docsEngine.writeFileContent(destinationRelativePath, content)
      await docsEngine.deleteFile(sourceRelativePath)
    } else {
      throw new HTTPException(500, {
        message: "ディレクトリの移動は現在サポートされていません",
      })
    }

    // 移動後のファイル情報を統一フォーマットで返す
    const docFileEntity = await docsEngine.getFile(destinationRelativePath)

    return c.json(docFileEntity.toJson())
  },
)
