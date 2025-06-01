import * as fs from "node:fs/promises"
import * as path from "node:path"
import { factory } from "@/lib/factory"
import { zAppCsvSave } from "@/lib/models"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { validateDocsPath } from "../utils"

const saveCsvSchema = z.object({
  filePath: z.string(),
  content: z.string(),
})

// PUT /api/files/csv - CSVファイルを保存
export const PUT = factory.createHandlers(
  zValidator("json", saveCsvSchema),
  async (c) => {
    const body = c.req.valid("json")

    const absolutePath = validateDocsPath(body.filePath)

    // ディレクトリが存在することを確認
    const directory = path.dirname(absolutePath)
    await fs.mkdir(directory, { recursive: true })

    // ファイルに書き込み
    await fs.writeFile(absolutePath, body.content, "utf-8")

    // 更新されたコンテンツを返す
    const response = zAppCsvSave.parse({
      success: true,
      content: body.content,
    })
    return c.json(response)
  },
)
