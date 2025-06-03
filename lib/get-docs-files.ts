import fs from "node:fs"
import path from "node:path"
import { OpenMarkdown } from "./open-markdown/open-markdown"
import { directoryFrontMatterSchema } from "./validations/directory-front-matter-schema"

export interface FileNode {
  name: string
  path: string
  type: "file" | "directory"
  children?: FileNode[]
  icon?: string
}

export function getDocsFiles(basePath = "docs"): FileNode[] {
  const docsPath = path.join(process.cwd(), basePath)

  if (!fs.existsSync(docsPath)) {
    return []
  }

  const entries = fs.readdirSync(docsPath, { withFileTypes: true })

  return entries.map((entry) => {
    const entryPath = path.join(basePath, entry.name)

    if (entry.isDirectory()) {
      // index.mdのFrontMatterからアイコンを読み込む
      let icon: string | undefined
      const indexPath = path.join(process.cwd(), entryPath, "index.md")
      console.log("indexPath", indexPath)
      if (fs.existsSync(indexPath)) {
        const indexContent = fs.readFileSync(indexPath, "utf-8")
        const openMarkdown = new OpenMarkdown(indexContent)
        const frontMatter = openMarkdown.frontMatter
        if (frontMatter) {
          const validatedFrontMatter =
            directoryFrontMatterSchema.parse(frontMatter)
          icon = validatedFrontMatter.icon
        }
      }

      return {
        name: entry.name,
        path: entryPath,
        type: "directory",
        children: getDocsFiles(entryPath),
        icon,
      }
    }
    return {
      name: entry.name,
      path: entryPath,
      type: "file",
    }
  })
}
