import { DocDirectoryReference } from "./doc-directory-reference"
import { DocFileIndexReference } from "./doc-file-index-reference"
import { DocFileMdReference } from "./doc-file-md-reference"
import type { DocFileSystem } from "./doc-file-system"
import { DocFileUnknownReference } from "./doc-file-unknown-reference"
import { DocMarkdownSystem } from "./doc-markdown-system"
import { DocPathSystem } from "./doc-path-system"
import type { DocTreeDirectoryNode, DocTreeFileNode } from "./types"
import { DocTreeDirectoryNodeValue } from "./values/doc-tree-directory-node-value"
import { DocTreeFileNodeValue } from "./values/doc-tree-file-node-value"

type Props = {
  fileSystem: DocFileSystem
  pathSystem?: DocPathSystem
  markdownSystem?: DocMarkdownSystem
  /**
   * default: "index.md"
   */
  indexFileName?: string
  /**
   * default: "_"
   */
  archiveDirectoryName?: string
}

export class DocClient {
  readonly fileSystem: DocFileSystem
  readonly pathSystem: DocPathSystem
  readonly markdownSystem: DocMarkdownSystem
  readonly indexFileName: string
  readonly archiveDirectoryName: string

  constructor(props: Props) {
    this.fileSystem = props.fileSystem
    this.pathSystem = props.pathSystem ?? new DocPathSystem()
    this.markdownSystem = props.markdownSystem ?? new DocMarkdownSystem()
    this.indexFileName = props.indexFileName ?? "index.md"
    this.archiveDirectoryName = props.archiveDirectoryName ?? "_"
  }

  basePath(): string {
    return this.fileSystem.getBasePath()
  }

  /**
   * ファイル参照を取得
   */
  file(relativePath: string): DocFileMdReference | DocFileUnknownReference {
    if (relativePath.endsWith(".md")) {
      return this.mdFile(relativePath)
    }

    return new DocFileUnknownReference({
      path: relativePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
    })
  }

  /**
   * Markdownファイル参照を取得
   */
  mdFile(relativePath: string): DocFileMdReference {
    return new DocFileMdReference({
      path: relativePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
    })
  }

  /**
   * インデックスファイル参照を取得
   */
  indexFile(directoryPath: string): DocFileIndexReference {
    const indexPath =
      directoryPath === ""
        ? this.indexFileName
        : `${directoryPath}/${this.indexFileName}`

    return new DocFileIndexReference({
      path: indexPath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
    })
  }

  /**
   * ディレクトリ参照を取得
   */
  directory(relativePath: string): DocDirectoryReference {
    return new DocDirectoryReference({
      path: relativePath,
      indexFileName: this.indexFileName,
      archiveDirectoryName: this.archiveDirectoryName,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
    })
  }

  /**
   * ファイルツリーを取得
   */
  async fileTree(
    directoryPath = "",
  ): Promise<(DocTreeFileNode | DocTreeDirectoryNode)[]> {
    const results = await this.buildFileTree(directoryPath)
    return results.map((node) => node.toJson())
  }

  /**
   * ファイルツリーを再帰的に構築
   */
  private async buildFileTree(
    directoryPath = "",
  ): Promise<(DocTreeFileNodeValue | DocTreeDirectoryNodeValue)[]> {
    const fileNames =
      await this.fileSystem.readDirectoryFileNames(directoryPath)
    const results: (DocTreeFileNodeValue | DocTreeDirectoryNodeValue)[] = []

    for (const fileName of fileNames) {
      // アーカイブディレクトリ（「_」で始まる）は除外
      if (fileName.startsWith("_")) continue

      const filePath = directoryPath
        ? this.pathSystem.join(directoryPath, fileName)
        : fileName
      const isDirectory = await this.fileSystem.isDirectory(filePath)

      if (!isDirectory) {
        let title = fileName
        let icon = ""

        // マークダウンファイルの場合はタイトルを取得
        if (fileName.endsWith(".md")) {
          const mdFile = this.mdFile(filePath)
          if (await mdFile.exists()) {
            const entity = await mdFile.read()
            if (!(entity instanceof Error)) {
              title = entity.value.content.title || fileName
            }
          }
          icon = "📄"
        } else {
          icon = "📄"
        }

        const fileNode = DocTreeFileNodeValue.from({
          name: fileName,
          path: filePath,
          icon,
          title,
        })

        results.push(fileNode)
        continue
      }

      // ディレクトリの場合
      let title = fileName
      let icon = "📁"

      const indexFile = this.indexFile(filePath)
      if (await indexFile.exists()) {
        const entity = await indexFile.read()
        title = entity.value.content.title || fileName
        icon = entity.value.content.frontMatter.icon || "📁"
      }

      const children = await this.buildFileTree(filePath)

      const directoryNode = DocTreeDirectoryNodeValue.from({
        name: fileName,
        path: filePath,
        icon,
        title,
        children,
      })

      results.push(directoryNode)
    }

    return results
  }

  /**
   * ディレクトリツリーを取得（ディレクトリのみ）
   */
  async directoryTree(directoryPath = ""): Promise<DocTreeDirectoryNode[]> {
    const results = await this.buildDirectoryTree(directoryPath)
    return results.map((node) => node.toJson())
  }

  /**
   * ディレクトリツリーを再帰的に構築（ディレクトリのみ）
   */
  private async buildDirectoryTree(
    directoryPath = "",
  ): Promise<DocTreeDirectoryNodeValue[]> {
    const fileNames =
      await this.fileSystem.readDirectoryFileNames(directoryPath)
    const results: DocTreeDirectoryNodeValue[] = []

    for (const fileName of fileNames) {
      // アーカイブディレクトリ（「_」で始まる）は除外
      if (fileName.startsWith("_")) continue

      const filePath = directoryPath
        ? this.pathSystem.join(directoryPath, fileName)
        : fileName
      const isDirectory = await this.fileSystem.isDirectory(filePath)

      // ファイルはスキップ
      if (!isDirectory) continue

      // ディレクトリの場合
      let title = fileName
      let icon = "📁"

      const indexFile = this.indexFile(filePath)
      if (await indexFile.exists()) {
        const entity = await indexFile.read()
        title = entity.value.content.title || fileName
        icon = entity.value.content.frontMatter.icon || "📁"
      }

      const children = await this.buildDirectoryTree(filePath)

      const directoryNode = DocTreeDirectoryNodeValue.from({
        name: fileName,
        path: filePath,
        icon,
        title,
        children,
      })

      results.push(directoryNode)
    }

    return results
  }
}
