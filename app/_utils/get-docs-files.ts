import fs from "node:fs"
import path from "node:path"

type FileNode = {
  name: string
  path: string
  type: "file" | "directory"
  children?: FileNode[]
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
      return {
        name: entry.name,
        path: relativePath,
        type: "directory" as const,
        children: await getDocsFiles(relativePath),
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
