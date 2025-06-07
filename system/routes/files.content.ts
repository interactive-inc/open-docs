import * as path from "node:path"
import { DocEngine } from "@/lib/docs-engine/doc-engine"
import { factory } from "@/lib/factory"
import { zAppError, zAppFileSave } from "@/lib/models"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

const saveFileContentSchema = z.object({
  filePath: z.string(),
  content: z.string(),
})

/**
 * ファイルコンテンツを保存する
 * @param filePath ファイルパス
 * @param content ファイル内容
 * @returns 保存結果
 */
export const PUT = factory.createHandlers(
  zValidator("json", saveFileContentSchema),
  async (c) => {
    const body = c.req.valid("json")

    const docsPath = path.join(process.cwd(), "docs")

    // 相対パスか絶対パスかを判定
    let relativePath: string
    if (path.isAbsolute(body.filePath)) {
      // 絶対パスの場合
      const isInDocsDir = body.filePath.startsWith(docsPath)
      if (!isInDocsDir) {
        const errorResponse = zAppError.parse({
          error: "Invalid file path: File must be in docs directory",
        })
        return c.json(errorResponse, 403)
      }
      relativePath = path.relative(docsPath, body.filePath)
    } else {
      // 相対パスの場合（docs/で始まることを想定）
      relativePath = body.filePath.replace(/^docs\//, "")
    }

    const docsEngine = new DocEngine({
      basePath: docsPath,
    })

    await docsEngine.writeFileContent(relativePath, body.content)

    const response = zAppFileSave.parse({
      success: true,
      content: body.content,
    })
    return c.json(response)
  },
)
