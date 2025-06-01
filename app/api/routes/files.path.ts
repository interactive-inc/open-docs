import fs from "node:fs/promises"
import { factory } from "@/lib/factory"
import { parseMarkdown } from "@/lib/markdown/parse-markdown"
import { zAppFile } from "@/lib/models"
import { validateDocsPath } from "../utils"

// GET /api/files/:path - ファイルコンテンツ取得
export const GET = factory.createHandlers(async (c) => {
  const currentPath = c.req.path.replace("/api/files/", "")

  const fullFilePath = `docs/${currentPath}`

  const fullPath = validateDocsPath(fullFilePath)

  const content = await fs.readFile(fullPath, "utf-8")

  const parsed = parseMarkdown(content)

  const response = zAppFile.parse({
    path: fullFilePath,
    frontMatter: parsed.frontMatter,
    content: parsed.content,
  })
  return c.json(response)
})
