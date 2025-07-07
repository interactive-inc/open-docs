import { DocDirectoryReference } from "./doc-directory-reference"
import { DocFileIndexReference } from "./doc-file-index-reference"
import { DocFileMdReference } from "./doc-file-md-reference"
import type { DocFileSystem } from "./doc-file-system"
import { DocFileTreeSystem } from "./doc-file-tree-system"
import { DocFileUnknownReference } from "./doc-file-unknown-reference"
import { DocMarkdownSystem } from "./doc-markdown-system"
import { DocPathSystem } from "./doc-path-system"
import type { DocTreeDirectoryNode, DocTreeFileNode } from "./types"

type Props = {
  fileSystem: DocFileSystem
  pathSystem?: DocPathSystem
  markdownSystem?: DocMarkdownSystem
  fileTreeSystem?: DocFileTreeSystem
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
  readonly fileTreeSystem: DocFileTreeSystem
  readonly indexFileName: string
  readonly archiveDirectoryName: string

  constructor(props: Props) {
    this.fileSystem = props.fileSystem
    this.pathSystem = props.pathSystem ?? new DocPathSystem()
    this.markdownSystem = props.markdownSystem ?? new DocMarkdownSystem()
    this.indexFileName = props.indexFileName ?? "index.md"
    this.archiveDirectoryName = props.archiveDirectoryName ?? "_"

    this.fileTreeSystem =
      props.fileTreeSystem ??
      new DocFileTreeSystem({
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
        indexFileName: this.indexFileName,
        archiveDirectoryName: this.archiveDirectoryName,
      })
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
    const normalizedPath = relativePath.endsWith(".md")
      ? relativePath
      : `${relativePath}.md`

    return new DocFileMdReference({
      path: normalizedPath,
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
    const results = await this.fileTreeSystem.buildFileTree(directoryPath)
    return results.map((node) => node.toJson())
  }

  /**
   * ディレクトリツリーを取得（ディレクトリのみ）
   */
  async directoryTree(directoryPath = ""): Promise<DocTreeDirectoryNode[]> {
    const results = await this.fileTreeSystem.buildDirectoryTree(directoryPath)
    return results.map((node) => node.toJson())
  }
}
