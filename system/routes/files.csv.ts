import * as path from "node:path"
import { DocsEngine } from "@/lib/docs-engine/docs-engine"
import { factory } from "@/lib/factory"
import { zAppCsvSave } from "@/lib/models"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { validateDocsPath } from "../utils"

const saveCsvSchema = z.object({
  filePath: z.string(),
  content: z.string(),
})

/**
 * CSVファイルを保存する
 * @param filePath ファイルパス
 * @param content CSVコンテンツ
 * @returns 保存結果
 */
export const PUT = factory.createHandlers(
  zValidator("json", saveCsvSchema),
  async (c) => {
    const body = c.req.valid("json")

    const absolutePath = validateDocsPath(body.filePath)
    const docsPath = path.join(process.cwd(), "docs")
    const relativePath = path.relative(docsPath, absolutePath)

    const docsEngine = new DocsEngine({
      basePath: docsPath,
    })

    const file = docsEngine.file(relativePath)
    await file.writeContent(body.content)

    const response = zAppCsvSave.parse({
      success: true,
      content: body.content,
    })
    return c.json(response)
  },
)
