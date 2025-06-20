import path from "node:path"
import { zDocFileNode } from "@/lib/models"
import type { DocFileNode } from "@/lib/types"
import type { DocFileNormalizeSystem } from "./doc-file-normalize-system"
import type { DocFileReadSystem } from "./doc-file-read-system"

type Props = {
  reader: DocFileReadSystem
  normalizer: DocFileNormalizeSystem
}

/**
 * ファイルツリーの構築を担当
 */
export class DocFileTreeSystem {
  private readonly reader: DocFileReadSystem
  private readonly normalizer: DocFileNormalizeSystem

  constructor(props: Props) {
    this.reader = props.reader
    this.normalizer = props.normalizer
  }

  /**
   * ファイルツリーを再帰的に取得（スキーマ検証付き）
   */
  async getFileTree(basePath = ""): Promise<DocFileNode[]> {
    await this.normalizer.validateFiles(basePath)

    const entries = await this.reader.fileSystemInstance.readDirectory(basePath)

    const results: DocFileNode[] = []

    for (const entry of entries) {
      // アーカイブディレクトリ（「_」で始まる）は除外
      if (entry.startsWith("_")) continue

      const entryPath = basePath ? path.join(basePath, entry) : entry

      const isDirectory = await this.reader.isDirectory(entryPath)

      if (!isDirectory) {
        let title: string = entry

        // マークダウンファイルの場合はタイトルを取得
        if (entry.endsWith(".md")) {
          try {
            const file = await this.reader.readFile(entryPath)
            title = file.title || entry
          } catch {
            // ファイル読み込みに失敗した場合はファイル名をフォールバック
            title = entry
          }
        }

        const fileNode = zDocFileNode.parse({
          name: entry,
          path: `docs/${entryPath}`,
          type: "file",
          children: [],
          icon: "",
          title,
        })

        results.push(fileNode)

        continue
      }

      let icon: string | null = null
      let title: string = entry

      const indexFileBuilder = await this.reader.readIndexFile(entryPath)

      if (indexFileBuilder) {
        // DocIndexFileBuilderからアイコンとタイトルを取得
        icon = indexFileBuilder.icon
        title = indexFileBuilder.title || entry
      }

      const children = await this.getFileTree(entryPath)

      const directoryNode = zDocFileNode.parse({
        name: entry,
        path: `docs/${entryPath}`,
        type: "directory",
        children,
        icon: icon || "",
        title,
      } satisfies DocFileNode)

      results.push(directoryNode)
    }

    return results
  }
}
