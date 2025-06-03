import * as path from "node:path"
import { DocsEngine } from "@/lib/docs-engine/docs-engine"
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
    const absolutePath = body.filePath
    const isInDocsDir = absolutePath.startsWith(docsPath)

    if (!isInDocsDir) {
      const errorResponse = zAppError.parse({
        error: "Invalid file path: File must be in docs directory",
      })
      return c.json(errorResponse, 403)
    }

    // 絶対パスから相対パスを計算
    const relativePath = path.relative(docsPath, absolutePath)

    const docsEngine = new DocsEngine({
      basePath: docsPath,
    })

    const file = docsEngine.file(relativePath)
    await file.writeContent(body.content)

    const response = zAppFileSave.parse({
      success: true,
      content: body.content,
    })
    return c.json(response)
  },
)
