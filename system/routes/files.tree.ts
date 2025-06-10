import path from "node:path"
import { DocEngine } from "@/lib/docs-engine/doc-engine"
import { factory } from "@/lib/factory"
import { zFileTreeResponse } from "@/system/models"
import type { FileNode } from "@/system/types"

export type { FileNode }

async function getDocsFiles(basePath = "docs"): Promise<FileNode[]> {
  const docsEngine = new DocEngine({
    basePath: path.join(process.cwd(), basePath),
  })

  for await (const _result of docsEngine.normalizeFileTree()) {
    // 結果を消費するだけ（ログは不要）
  }

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
        }
      }

      // サブディレクトリ内のファイルを処理
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
}

/**
 * ファイルツリーを取得する
 * @returns ファイルツリー情報
 */
export const GET = factory.createHandlers(async (c) => {
  const files = await getDocsFiles()

  const response = zFileTreeResponse.parse({ files })

  return c.json(response)
})
