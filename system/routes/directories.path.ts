import path from "node:path"
import { DocEngine } from "@/lib/docs-engine/doc-engine"
import { factory } from "@/lib/factory"
import { zAppFileFrontMatter } from "@/system/models"
import { zDirectoryResponse } from "@/system/models"
import { HTTPException } from "hono/http-exception"

/**
 * GET /api/directories/:path - ディレクトリデータ取得（ディレクトリ専用）
 */
export const GET = factory.createHandlers(async (c) => {
  const currentPath = c.req.param("path")

  if (currentPath === undefined) {
    throw new HTTPException(400, {})
  }

  const docsPath = "docs"

  const mainEngine = new DocEngine({
    basePath: path.join(process.cwd(), docsPath),
  })

  // パスの存在確認
  if (!(await mainEngine.exists(currentPath))) {
    throw new HTTPException(404, {
      message: `ディレクトリが見つかりません: ${currentPath}`,
    })
  }

  // ディレクトリであることを確認
  if (!(await mainEngine.isDirectory(currentPath))) {
    throw new HTTPException(400, {
      message: `指定されたパスはディレクトリではありません: ${currentPath}`,
    })
  }

  // ディレクトリ情報を完全取得
  const directoryData = await mainEngine.getDirectoryDataForApi(currentPath)

  const files = directoryData.files.map((file) => {
    // zodでバリデーションして適合しない値を除外
    const parsedFrontMatter = zAppFileFrontMatter.safeParse(file.frontMatter)

    return {
      ...file,
      frontMatter: parsedFrontMatter.success
        ? parsedFrontMatter.data
        : file.frontMatter || {},
    }
  })

  // レスポンスを検証してから返す
  const validatedResponse = zDirectoryResponse.parse({
    isFile: false as const,
    schema: directoryData.schema,
    columns: directoryData.columns,
    title: directoryData.rawData.title || directoryData.directoryName,
    description: directoryData.directoryDescription,
    icon: directoryData.rawData.icon || "📁",
    indexPath: directoryData.rawData.indexPath,
    files,
    // 追加の計算済み値
    directoryName: directoryData.directoryName,
    markdownFilePaths: files.map((f) => f.path),
    cwd: process.cwd(),
    relations: directoryData.relations,
  })

  return c.json(validatedResponse)
})
