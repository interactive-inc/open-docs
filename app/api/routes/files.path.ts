import fs from "node:fs/promises"
import { factory } from "@/lib/factory"
import { parseMarkdown } from "@/lib/markdown/parse-markdown"
import { validateDocsPath } from "../utils"

// GET /api/files/:path - ファイルコンテンツ取得
export const GET = factory.createHandlers(async (c) => {
  const currentPath = c.req.path.replace("/api/files/", "")

  const fullFilePath = `docs/${currentPath}`

  const fullPath = validateDocsPath(fullFilePath)

  const content = await fs.readFile(fullPath, "utf-8")

  const parsed = parseMarkdown(content)

  return c.json({
    path: fullFilePath,
    frontMatter: parsed.frontMatter,
    content: parsed.content,
  })
})
