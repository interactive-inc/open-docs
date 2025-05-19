import fs from "node:fs"
import path from "node:path"

export interface FileNode {
  name: string
  path: string
  type: "file" | "directory"
  children?: FileNode[]
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
      return {
        name: entry.name,
        path: entryPath,
        type: "directory",
        children: getDocsFiles(entryPath),
      }
    }
    return {
      name: entry.name,
      path: entryPath,
      type: "file",
    }
  })
}
