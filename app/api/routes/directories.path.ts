import fs from "node:fs/promises"
import path from "node:path"
import { factory } from "@/lib/factory"
import { isFile } from "@/lib/is-file"
import { parseMarkdown } from "@/lib/markdown/parse-markdown"
import { zAppDirectory, zAppError } from "@/lib/models"
import { directoryFrontMatterSchema } from "@/lib/validations/directory-front-matter-schema"

// GET /api/directories/:path - ディレクトリまたはファイルデータ取得
export const GET = factory.createHandlers(async (c) => {
  const currentPath = c.req.path.replace("/api/directories/", "")

  if (!currentPath) {
    const errorResponse = zAppError.parse({ error: "Path is required" })
    return c.json(errorResponse, 400)
  }

  const filePath = path.join(process.cwd(), "docs", currentPath)

  const fileExists = await isFile(filePath)

  if (fileExists) {
    // ファイルの場合
    try {
      const content = await fs.readFile(filePath, "utf-8")
      const response = zAppDirectory.parse({
        isFile: true,
        content,
        filePath,
      })
      return c.json(response)
    } catch (error) {
      console.error("File schema validation error:", error)
      const errorResponse = zAppError.parse({ error: "File validation failed" })
      return c.json(errorResponse, 500)
    }
  }

  // ディレクトリの場合
  let schema = null
  let title = null
  let description = null
  const indexPath = path.join("docs", currentPath, "index.md")

  let indexExists = false
  try {
    const indexFullPath = path.join(process.cwd(), indexPath)
    const indexContent = await fs.readFile(indexFullPath, "utf-8")
    const { frontMatter } = parseMarkdown(indexContent)
    if (frontMatter) {
      const validatedFrontMatter = directoryFrontMatterSchema.parse(frontMatter)
      schema = validatedFrontMatter.schema
      title = validatedFrontMatter.title
      description = validatedFrontMatter.description
    }
    indexExists = true
  } catch {
    // index.mdがないか、スキーマがない場合はスキップ
  }

  // ディレクトリ内のMarkdownファイルを取得
  const dirPath = path.join(process.cwd(), "docs", currentPath)
  const files: Array<{
    path: string
    frontMatter: Record<string, unknown>
    content: string
  }> = []

  try {
    const entries = await fs.readdir(dirPath)

    for (const entry of entries) {
      if (
        entry.endsWith(".md") &&
        entry !== "README.md" &&
        entry !== "index.md"
      ) {
        const filePath = path.join(dirPath, entry)
        const fileContent = await fs.readFile(filePath, "utf-8")
        const parsed = parseMarkdown(fileContent)

        files.push({
          path: path.join("docs", currentPath, entry),
          frontMatter: parsed.frontMatter,
          content: parsed.content,
        })
      }
    }
  } catch {
    // ディレクトリが存在しない場合はスキップ
  }

  const data = zAppDirectory.parse({
    isFile: false,
    schema,
    title,
    description,
    indexPath: indexExists ? indexPath : undefined,
    files,
  })

  return c.json(data)
})
