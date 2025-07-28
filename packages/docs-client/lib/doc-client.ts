import { DocDirectoryReference } from "./doc-directory-reference"
import { DocFileIndexReference } from "./doc-file-index-reference"
import { DocFileMdReference } from "./doc-file-md-reference"
import type { DocFileSystem } from "./doc-file-system"
import { DocFileTreeSystem } from "./doc-file-tree-system"
import { DocFileUnknownReference } from "./doc-file-unknown-reference"
import { DocMarkdownSystem } from "./doc-markdown-system"
import { DocPathSystem } from "./doc-path-system"
import type {
  DocClientConfig,
  DocCustomSchema,
  DocTreeDirectoryNode,
  DocTreeNode,
} from "./types"

type Props = {
  fileSystem: DocFileSystem
  pathSystem?: DocPathSystem
  markdownSystem?: DocMarkdownSystem
  fileTreeSystem?: DocFileTreeSystem
  /**
   * Configuration
   */
  config?: DocClientConfig
}

export class DocClient {
  readonly fileSystem: DocFileSystem
  readonly pathSystem: DocPathSystem
  readonly markdownSystem: DocMarkdownSystem
  readonly fileTreeSystem: DocFileTreeSystem
  readonly config: DocClientConfig

  constructor(props: Props) {
    this.fileSystem = props.fileSystem
    this.pathSystem = props.pathSystem ?? new DocPathSystem()
    this.markdownSystem = props.markdownSystem ?? new DocMarkdownSystem()
    this.config = props.config ?? {
      defaultIndexIcon: "📃",
      indexFileName: "index.md",
      archiveDirectoryName: "_",
      defaultDirectoryName: "Directory",
      indexMetaIncludes: [],
      directoryExcludes: [".vitepress"],
    }

    this.fileTreeSystem =
      props.fileTreeSystem ??
      new DocFileTreeSystem({
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
        indexFileName: this.config.indexFileName,
        archiveDirectoryName: this.config.archiveDirectoryName,
        config: this.config,
      })
  }

  basePath(): string {
    return this.fileSystem.getBasePath()
  }

  file(
    relativePath: string,
  ): DocFileMdReference<DocCustomSchema> | DocFileUnknownReference

  file<T extends DocCustomSchema>(
    relativePath: string,
    customSchema: T,
  ): DocFileMdReference<T> | DocFileUnknownReference

  /**
   * Get file reference
   */
  file<T extends DocCustomSchema>(relativePath: string, customSchema?: T) {
    if (relativePath.endsWith(".md") && customSchema === undefined) {
      return this.mdFile(relativePath)
    }

    if (relativePath.endsWith(".md") && customSchema !== undefined) {
      return this.mdFile<T>(relativePath, customSchema)
    }

    return new DocFileUnknownReference({
      path: relativePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      config: this.config,
    })
  }

  mdFile(relativePath: string): DocFileMdReference<DocCustomSchema>

  mdFile<T extends DocCustomSchema>(
    relativePath: string,
    customSchema: T,
  ): DocFileMdReference<T>

  /**
   * Markdown file reference
   */
  mdFile<T extends DocCustomSchema>(relativePath: string, customSchema?: T) {
    const normalizedPath = relativePath.endsWith(".md")
      ? relativePath
      : `${relativePath}.md`

    if (customSchema === undefined) {
      return new DocFileMdReference<DocCustomSchema>({
        path: normalizedPath,
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
        customSchema: {},
        config: this.config,
      })
    }

    return new DocFileMdReference({
      path: normalizedPath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      customSchema: customSchema,
      config: this.config,
    })
  }

  indexFile(relativePath: string): DocFileIndexReference<DocCustomSchema>

  indexFile<T extends DocCustomSchema>(
    relativePath: string,
    customSchema: T,
  ): DocFileIndexReference<T>

  /**
   * Index file reference
   */
  indexFile<T extends DocCustomSchema>(relativePath: string, customSchema?: T) {
    const indexPath =
      relativePath === ""
        ? this.config.indexFileName
        : `${relativePath}/${this.config.indexFileName}`

    if (customSchema === undefined) {
      return new DocFileIndexReference<DocCustomSchema>({
        path: indexPath,
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
        customSchema: {},
        config: this.config,
      })
    }

    return new DocFileIndexReference<T>({
      path: indexPath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      customSchema: customSchema,
      config: this.config,
    })
  }

  directory(relativePath: string): DocDirectoryReference<DocCustomSchema>

  directory<T extends DocCustomSchema>(
    relativePath: string,
    customSchema: T,
  ): DocDirectoryReference<T>

  /**
   * Directory reference
   */
  directory<T extends DocCustomSchema>(relativePath: string, customSchema?: T) {
    if (customSchema === undefined) {
      return new DocDirectoryReference<DocCustomSchema>({
        customSchema: {},
        path: relativePath,
        indexFileName: this.config.indexFileName,
        archiveDirectoryName: this.config.archiveDirectoryName,
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
        config: this.config,
      })
    }

    return new DocDirectoryReference<T>({
      customSchema: customSchema,
      path: relativePath,
      indexFileName: this.config.indexFileName,
      archiveDirectoryName: this.config.archiveDirectoryName,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      config: this.config,
    })
  }

  async fileTree(directoryPath = ""): Promise<DocTreeNode[]> {
    const results = await this.fileTreeSystem.buildFileTree(directoryPath)
    return results.map((node) => node.toJson())
  }

  async directoryTree(directoryPath = ""): Promise<DocTreeDirectoryNode[]> {
    const results = await this.fileTreeSystem.buildDirectoryTree(directoryPath)
    return results.map((node) => node.toJson())
  }
}
