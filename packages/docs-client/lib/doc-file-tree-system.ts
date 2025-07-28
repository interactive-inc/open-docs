import { DocFileIndexReference } from "./doc-file-index-reference"
import { DocFileMdReference } from "./doc-file-md-reference"
import type { DocFileSystem } from "./doc-file-system"
import type { DocPathSystem } from "./doc-path-system"
import type { DocClientConfig, DocCustomSchema } from "./types"
import { DocTreeDirectoryNodeValue } from "./values/doc-tree-directory-node-value"
import { DocTreeFileNodeValue } from "./values/doc-tree-file-node-value"
import type { DocTreeNodeValue } from "./values/doc-tree-node-value"

type Props = {
  fileSystem: DocFileSystem
  pathSystem: DocPathSystem
  indexFileName: string
  archiveDirectoryName: string
  config: DocClientConfig
}

/**
 * File tree building system
 */
export class DocFileTreeSystem {
  private readonly config: DocClientConfig

  constructor(private readonly props: Props) {
    this.config = props.config
    Object.freeze(this)
  }

  /**
   * Build file tree recursively
   */
  async buildFileTree(directoryPath = ""): Promise<DocTreeNodeValue[]> {
    const fileNames =
      await this.props.fileSystem.readDirectoryFileNames(directoryPath)
    const results: DocTreeNodeValue[] = []

    for (const fileName of fileNames) {
      if (fileName === this.props.archiveDirectoryName) continue

      // Skip directories in exclusion list
      if (this.config.directoryExcludes.includes(fileName)) continue

      const filePath = directoryPath
        ? this.props.pathSystem.join(directoryPath, fileName)
        : fileName

      const isDirectory = await this.props.fileSystem.isDirectory(filePath)

      if (!isDirectory) {
        const fileNode = await this.createFileNode(fileName, filePath)
        results.push(fileNode)
        continue
      }

      const directoryNode = await this.createDirectoryNode(fileName, filePath)
      results.push(directoryNode)
    }

    return results
  }

  /**
   * Create file node
   */
  private async createFileNode(
    fileName: string,
    filePath: string,
  ): Promise<DocTreeFileNodeValue> {
    let title = fileName
    let icon = ""

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
   * Create directory node
   */
  private async createDirectoryNode(
    fileName: string,
    filePath: string,
  ): Promise<DocTreeDirectoryNodeValue> {
    let title = fileName
    let icon = this.config.defaultIndexIcon

    const indexFile = this.createIndexFileReference(filePath)

    if (await indexFile.exists()) {
      const entity = await indexFile.read()
      title = entity.value.content.title || fileName
      const content = entity.content
      const frontMatter = content.meta()
      if (frontMatter) {
        icon = frontMatter.icon || this.config.defaultIndexIcon
      }
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
   * Create index file reference
   */
  private createIndexFileReference(
    directoryPath: string,
  ): DocFileIndexReference<DocCustomSchema> {
    const indexPath =
      directoryPath === ""
        ? this.props.indexFileName
        : `${directoryPath}/${this.props.indexFileName}`

    return new DocFileIndexReference<DocCustomSchema>({
      path: indexPath,
      fileSystem: this.props.fileSystem,
      pathSystem: this.props.pathSystem,
      customSchema: {},
      config: this.config,
    })
  }

  /**
   * Create MD file reference
   */
  private createMdFileReference(
    path: string,
  ): DocFileMdReference<DocCustomSchema> {
    return new DocFileMdReference({
      path,
      fileSystem: this.props.fileSystem,
      pathSystem: this.props.pathSystem,
      customSchema: {},
      config: this.config,
    })
  }

  /**
   * Build directory tree recursively (directories only)
   */
  async buildDirectoryTree(
    directoryPath = "",
  ): Promise<DocTreeDirectoryNodeValue[]> {
    const fileNames =
      await this.props.fileSystem.readDirectoryFileNames(directoryPath)
    const results: DocTreeDirectoryNodeValue[] = []

    for (const fileName of fileNames) {
      if (fileName === this.props.archiveDirectoryName) continue

      // Skip directories in exclusion list
      if (this.config.directoryExcludes.includes(fileName)) continue

      const filePath = directoryPath
        ? this.props.pathSystem.join(directoryPath, fileName)
        : fileName
      const isDirectory = await this.props.fileSystem.isDirectory(filePath)
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
   * Create directory node for directory tree
   */
  private async createDirectoryNodeForTree(
    fileName: string,
    filePath: string,
  ): Promise<DocTreeDirectoryNodeValue> {
    let title = fileName
    let icon = this.config.defaultIndexIcon

    const indexFile = this.createIndexFileReference(filePath)

    if (await indexFile.exists()) {
      const entity = await indexFile.read()
      title = entity.value.content.title || fileName
      const content = entity.content
      const frontMatter = content.meta()
      if (
        frontMatter &&
        typeof frontMatter === "object" &&
        "icon" in frontMatter
      ) {
        icon = frontMatter.icon || this.config.defaultIndexIcon
      }
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
