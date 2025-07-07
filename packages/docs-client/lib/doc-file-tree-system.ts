import { DocFileIndexReference } from "./doc-file-index-reference"
import { DocFileMdReference } from "./doc-file-md-reference"
import type { DocFileSystem } from "./doc-file-system"
import type { DocPathSystem } from "./doc-path-system"
import { DocTreeDirectoryNodeValue } from "./values/doc-tree-directory-node-value"
import { DocTreeFileNodeValue } from "./values/doc-tree-file-node-value"

type Props = {
  fileSystem: DocFileSystem
  pathSystem: DocPathSystem
  indexFileName: string
  archiveDirectoryName: string
}

/**
 * ファイルツリー構築システム
 */
export class DocFileTreeSystem {
  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  /**
   * ファイルツリーを再帰的に構築
   */
  async buildFileTree(
    directoryPath = "",
  ): Promise<(DocTreeFileNodeValue | DocTreeDirectoryNodeValue)[]> {
    const fileNames =
      await this.props.fileSystem.readDirectoryFileNames(directoryPath)
    const results: (DocTreeFileNodeValue | DocTreeDirectoryNodeValue)[] = []

    for (const fileName of fileNames) {
      // アーカイブディレクトリ（「_」で始まる）は除外
      if (fileName.startsWith("_")) continue

      const filePath = directoryPath
        ? this.props.pathSystem.join(directoryPath, fileName)
        : fileName
      const isDirectory = await this.props.fileSystem.isDirectory(filePath)

      if (!isDirectory) {
        const fileNode = await this.createFileNode(fileName, filePath)
        results.push(fileNode)
        continue
      }

      // ディレクトリの場合
      const directoryNode = await this.createDirectoryNode(fileName, filePath)
      results.push(directoryNode)
    }

    return results
  }

  /**
   * ファイルノードを作成
   */
  private async createFileNode(
    fileName: string,
    filePath: string,
  ): Promise<DocTreeFileNodeValue> {
    let title = fileName
    let icon = ""

    // マークダウンファイルの場合はタイトルを取得
    if (fileName.endsWith(".md")) {
      const mdFile = this.createMdFileReference(filePath)
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

    return DocTreeFileNodeValue.from({
      name: fileName,
      path: filePath,
      icon,
      title,
    })
  }

  /**
   * ディレクトリノードを作成
   */
  private async createDirectoryNode(
    fileName: string,
    filePath: string,
  ): Promise<DocTreeDirectoryNodeValue> {
    let title = fileName
    let icon = "📁"

    const indexFile = this.createIndexFileReference(filePath)
    if (await indexFile.exists()) {
      const entity = await indexFile.read()
      title = entity.value.content.title || fileName
      icon = entity.value.content.frontMatter.icon || "📁"
    }

    const children = await this.buildFileTree(filePath)

    return DocTreeDirectoryNodeValue.from({
      name: fileName,
      path: filePath,
      icon,
      title,
      children,
    })
  }

  /**
   * インデックスファイル参照を作成
   */
  private createIndexFileReference(
    directoryPath: string,
  ): DocFileIndexReference {
    const indexPath =
      directoryPath === ""
        ? this.props.indexFileName
        : `${directoryPath}/${this.props.indexFileName}`

    return new DocFileIndexReference({
      path: indexPath,
      fileSystem: this.props.fileSystem,
      pathSystem: this.props.pathSystem,
    })
  }

  /**
   * MDファイル参照を作成
   */
  private createMdFileReference(path: string): DocFileMdReference {
    return new DocFileMdReference({
      path,
      fileSystem: this.props.fileSystem,
      pathSystem: this.props.pathSystem,
    })
  }

  /**
   * ディレクトリツリーを再帰的に構築（ディレクトリのみ）
   */
  async buildDirectoryTree(
    directoryPath = "",
  ): Promise<DocTreeDirectoryNodeValue[]> {
    const fileNames =
      await this.props.fileSystem.readDirectoryFileNames(directoryPath)
    const results: DocTreeDirectoryNodeValue[] = []

    for (const fileName of fileNames) {
      // アーカイブディレクトリ（「_」で始まる）は除外
      if (fileName.startsWith("_")) continue

      const filePath = directoryPath
        ? this.props.pathSystem.join(directoryPath, fileName)
        : fileName
      const isDirectory = await this.props.fileSystem.isDirectory(filePath)

      // ファイルは無視
      if (!isDirectory) continue

      const directoryNode = await this.createDirectoryNodeForTree(
        fileName,
        filePath,
      )
      results.push(directoryNode)
    }

    return results
  }

  /**
   * ディレクトリツリー用のディレクトリノードを作成
   */
  private async createDirectoryNodeForTree(
    fileName: string,
    filePath: string,
  ): Promise<DocTreeDirectoryNodeValue> {
    let title = fileName
    let icon = "📁"

    const indexFile = this.createIndexFileReference(filePath)
    if (await indexFile.exists()) {
      const entity = await indexFile.read()
      title = entity.value.content.title || fileName
      icon = entity.value.content.frontMatter.icon || "📁"
    }

    const children = await this.buildDirectoryTree(filePath)

    return DocTreeDirectoryNodeValue.from({
      name: fileName,
      path: filePath,
      icon,
      title,
      children,
    })
  }
}
