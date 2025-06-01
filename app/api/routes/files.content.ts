import * as fs from "node:fs/promises"
import * as path from "node:path"
import { factory } from "@/lib/factory"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

const saveFileContentSchema = z.object({
  filePath: z.string(),
  content: z.string(),
})

// PUT /api/files/content - ファイルコンテンツを保存
export const PUT = factory.createHandlers(
  zValidator("json", saveFileContentSchema),
  async (c) => {
    const body = c.req.valid("json")

    const docsPath = path.join(process.cwd(), "docs")
    const absolutePath = body.filePath
    const isInDocsDir = absolutePath.startsWith(docsPath)

    if (!isInDocsDir) {
      return c.json(
        {
          error: "Invalid file path: File must be in docs directory",
        },
        403,
      )
    }

    const directory = path.dirname(absolutePath)
    await fs.mkdir(directory, { recursive: true })
    await fs.writeFile(absolutePath, body.content, "utf-8")

    return c.json({
      success: true,
      content: body.content,
    })
  },
)
