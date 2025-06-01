import fs from "node:fs"
import path from "node:path"
import { parseMarkdown } from "@/lib/markdown/parse-markdown"
import { directoryFrontMatterSchema } from "@/lib/validations/directory-front-matter-schema"

type FileNode = {
  name: string
  path: string
  type: "file" | "directory"
  children?: FileNode[]
  icon?: string
}

export async function getDocsFiles(dirPath = "docs"): Promise<FileNode[]> {
  const absolutePath = path.isAbsolute(dirPath)
    ? dirPath
    : path.join(process.cwd(), dirPath)

  if (!fs.existsSync(absolutePath)) {
    return []
  }

  const entries = fs.readdirSync(absolutePath, { withFileTypes: true })

  const promises = entries.map(async (entry) => {
    const relativePath = path.join(dirPath, entry.name)

    const fullPath = path.join(absolutePath, entry.name)

    if (entry.isDirectory()) {
      // index.mdのFrontMatterからアイコンを読み込む
      let icon: string | undefined
      try {
        const indexPath = path.join(fullPath, "index.md")
        if (fs.existsSync(indexPath)) {
          const indexContent = fs.readFileSync(indexPath, "utf-8")
          const { frontMatter } = parseMarkdown(indexContent)
          if (frontMatter) {
            const validatedFrontMatter =
              directoryFrontMatterSchema.parse(frontMatter)
            icon = validatedFrontMatter.icon
          }
        }
      } catch {
        // エラーの場合はスキップ
      }

      return {
        name: entry.name,
        path: relativePath,
        type: "directory" as const,
        children: await getDocsFiles(relativePath),
        icon,
      }
    }

    return {
      name: entry.name,
      path: relativePath,
      type: "file" as const,
    }
  })

  return Promise.all(promises)
}
