import path from "node:path"
import { DocEngine } from "@/lib/docs-engine/doc-engine"
import { factory } from "@/lib/factory"
import { zAppFileTree } from "@/lib/models"

export interface FileNode {
  name: string
  path: string
  type: "file" | "directory"
  children?: FileNode[]
  icon?: string
}

async function getDocsFiles(basePath = "docs"): Promise<FileNode[]> {
  const docsEngine = new DocEngine({
    basePath: path.join(process.cwd(), basePath),
  })

  try {
    // 内部API使用（一時的対応）
    const entries = await docsEngine.deps.fileSystem.readDirectory("")
    const results: FileNode[] = []

    for (const entry of entries) {
      const entryPath = path.join(basePath, entry)
      const isDirectory = await docsEngine.isDirectory(entry)

      if (isDirectory) {
        // index.mdのフロントマターからアイコンを読み込む
        let icon: string | null = null

        if (await docsEngine.hasIndexFile(entry)) {
          try {
            const docDirectory = await docsEngine.getDirectory(entry)
            icon = docDirectory.icon
          } catch (error) {
            console.error(`Error reading directory ${entry}:`, error)
            // エラーの場合はアイコンなし
          }
        }

        const children = await getDocsFiles(entryPath)
        results.push({
          name: entry,
          path: entryPath,
          type: "directory",
          children,
          icon: icon || undefined,
        })
      } else {
        results.push({
          name: entry,
          path: entryPath,
          type: "file",
        })
      }
    }

    return results
  } catch (error) {
    console.error("Error in getDocsFiles:", error)
    return []
  }
}

/**
 * ファイルツリーを取得する
 * @returns ファイルツリー情報
 */
export const GET = factory.createHandlers(async (c) => {
  const files = await getDocsFiles()

  const response = zAppFileTree.parse({ files })
  return c.json(response)
})
