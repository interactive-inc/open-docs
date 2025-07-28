import { DocDirectoryReference } from "./doc-directory-reference"
import type { DocFileSystem } from "./doc-file-system"
import type { DocPathSystem } from "./doc-path-system"
import { DocFileUnknownEntity } from "./entities/doc-file-unknown-entity"
import type { DocClientConfig, DocCustomSchema } from "./types"
import { DocFilePathValue } from "./values/doc-file-path-value"

type Props = {
  path: string
  fileSystem: DocFileSystem
  pathSystem: DocPathSystem
  config: DocClientConfig
}

/**
 * File reference
 */
export class DocFileUnknownReference {
  private readonly pathSystem: DocPathSystem

  constructor(private readonly props: Props) {
    this.pathSystem = props.pathSystem
    Object.freeze(this)
  }

  get fileSystem(): DocFileSystem {
    return this.props.fileSystem
  }

  get basePath(): string {
    return this.fileSystem.getBasePath()
  }

  get path(): string {
    return this.props.path
  }

  get directoryPath(): string {
    return this.pathSystem.dirname(this.path)
  }

  get fileFullPath(): string {
    return this.pathSystem.join(this.basePath, this.path)
  }

  get durectoryPath(): string {
    return this.pathSystem.dirname(this.path)
  }

  directory<T extends DocCustomSchema>(
    customSchema: T,
  ): DocDirectoryReference<T>

  directory(): DocDirectoryReference<DocCustomSchema>

  directory<T extends DocCustomSchema>(customSchema?: T) {
    return new DocDirectoryReference({
      archiveDirectoryName: this.props.config.archiveDirectoryName,
      indexFileName: this.props.config.indexFileName,
      fileSystem: this.fileSystem,
      path: this.directoryPath,
      pathSystem: this.pathSystem,
      customSchema: customSchema ?? {},
      config: this.props.config,
    })
  }

  async read(): Promise<Error | DocFileUnknownEntity> {
    const content = await this.fileSystem.readFile(this.path)

    if (content === null) {
      return new Error(`File not found at ${this.path}.`)
    }

    const isInArchiveDir =
      this.path.includes("/_/") || this.path.startsWith("_/")

    if (this.path.endsWith(".md")) {
      throw new Error("Use DocFileMdReference to read Markdown files.")
    }

    const pathValue = DocFilePathValue.fromPathWithSystem(
      this.path,
      this.pathSystem,
      this.basePath,
    )

    const extension = this.pathSystem.extname(this.path).substring(1) // Remove dot

    return new DocFileUnknownEntity({
      type: "unknown",
      path: pathValue.value,
      content: content,
      extension: extension,
      isArchived: isInArchiveDir,
    })
  }

  /**
   * Read file content
   */
  async readContent(): Promise<Error | string> {
    const entity = await this.read()
    if (entity instanceof Error) {
      return entity
    }
    return entity.value.content
  }

  /**
   * Write content to file
   */
  async writeContent(content: string): Promise<void> {
    await this.fileSystem.writeFile(this.path, content)
  }

  /**
   * Write entity
   */
  async write(entity: DocFileUnknownEntity): Promise<void> {
    await this.fileSystem.writeFile(this.path, entity.value.content)
  }

  /**
   * Write raw content
   */
  async writeRaw(content: string): Promise<void> {
    await this.fileSystem.writeFile(this.path, content)
  }

  /**
   * Delete file
   */
  async delete(): Promise<Error | null> {
    return await this.fileSystem.deleteFile(this.path)
  }

  /**
   * Check if file exists
   */
  async exists(): Promise<boolean> {
    return this.fileSystem.exists(this.path)
  }

  /**
   * Copy file
   */
  async copyTo(destinationPath: string): Promise<void> {
    await this.fileSystem.copyFile(this.path, destinationPath)
  }

  /**
   * Move file
   */
  async moveTo(destinationPath: string): Promise<void> {
    await this.fileSystem.moveFile(this.path, destinationPath)
  }

  /**
   * Get file size in bytes
   */
  async size(): Promise<number> {
    return this.fileSystem.getFileSize(this.path)
  }

  /**
   * Get file last modified time
   */
  async lastModified(): Promise<Date> {
    return this.fileSystem.getFileModifiedTime(this.path)
  }

  /**
   * Get file creation time
   */
  async createdAt(): Promise<Date> {
    return this.fileSystem.getFileCreatedTime(this.path)
  }

  /**
   * Move file to archive and return new reference
   */
  async archive(
    archiveDirectoryName = this.props.config.archiveDirectoryName,
  ): Promise<DocFileUnknownReference> {
    const dirPath = this.pathSystem.dirname(this.path)
    const fileName = this.pathSystem.basename(this.path)
    const archivePath = this.pathSystem.join(
      dirPath,
      archiveDirectoryName,
      fileName,
    )

    await this.moveTo(archivePath)

    return new DocFileUnknownReference({
      path: archivePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      config: this.props.config,
    })
  }

  /**
   * Restore file from archive and return new reference
   */
  async restore(
    archiveDirectoryName = this.props.config.archiveDirectoryName,
  ): Promise<DocFileUnknownReference> {
    const dirPath = this.pathSystem.dirname(this.path)
    const parentDirName = this.pathSystem.basename(dirPath)

    if (parentDirName !== archiveDirectoryName) {
      throw new Error(`File is not in archive directory: ${this.path}`)
    }

    const fileName = this.pathSystem.basename(this.path)
    const restorePath = this.pathSystem.join(
      this.pathSystem.dirname(dirPath),
      fileName,
    )

    // Move file
    await this.moveTo(restorePath)

    return new DocFileUnknownReference({
      path: restorePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      config: this.props.config,
    })
  }
}
