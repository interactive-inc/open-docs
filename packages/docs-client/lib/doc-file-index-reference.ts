import { DocFileRelationReference } from "./doc-file-relation-reference"
import type { DocFileSystem } from "./doc-file-system"
import type { DocPathSystem } from "./doc-path-system"
import { DocFileIndexEntity } from "./entities/doc-file-index-entity"
import type { DocClientConfig, DocCustomSchema } from "./types"
import { DocFileIndexContentValue } from "./values/doc-file-index-content-value"
import { DocFilePathValue } from "./values/doc-file-path-value"
import type { DocRelationValue } from "./values/doc-relation-value"

type Props<T extends DocCustomSchema> = {
  customSchema: T
  path: string
  fileSystem: DocFileSystem
  pathSystem: DocPathSystem
  config: DocClientConfig
}

/**
 * File reference class
 */
export class DocFileIndexReference<T extends DocCustomSchema> {
  private readonly pathSystem: DocPathSystem

  private readonly customSchema: T

  constructor(private readonly props: Props<T>) {
    this.pathSystem = props.pathSystem
    this.customSchema = props.customSchema
    Object.freeze(this)
  }

  get fileSystem(): DocFileSystem {
    return this.props.fileSystem
  }

  get basePath(): string {
    return this.fileSystem.getBasePath()
  }

  get filePath(): string {
    return this.props.path
  }

  get fileFullPath(): string {
    return this.pathSystem.join(this.basePath, this.filePath)
  }

  get durectoryPath(): string {
    return this.pathSystem.dirname(this.filePath)
  }

  async read(): Promise<DocFileIndexEntity<T>> {
    const content = await this.fileSystem.readFile(this.filePath)
    if (content === null) {
      // Get directory name for index.md
      const dirPath = this.pathSystem.dirname(this.filePath)
      const dirName = this.pathSystem.basename(dirPath)
      const pathValue = DocFilePathValue.fromPathWithSystem(
        this.filePath,
        this.pathSystem,
        this.fileSystem.getBasePath(),
      )
      const contentValue = DocFileIndexContentValue.empty(
        dirName,
        this.customSchema,
        this.props.config,
      )
      return new DocFileIndexEntity(
        {
          type: "index",
          path: pathValue.toJson(),
          content: contentValue.toJson(),
          isArchived: false,
        },
        this.customSchema,
      )
    }

    const pathValue = DocFilePathValue.fromPathWithSystem(
      this.filePath,
      this.pathSystem,
      this.fileSystem.getBasePath(),
    )

    const contentValue = DocFileIndexContentValue.fromMarkdown(
      content,
      this.customSchema,
      this.props.config,
    )

    return new DocFileIndexEntity(
      {
        type: "index",
        path: pathValue.toJson(),
        content: contentValue.toJson(),
        isArchived: false,
      },
      this.customSchema,
    )
  }

  /**
   * Read file content
   */
  async readContent(): Promise<Error | string> {
    const entity = await this.read()

    if (entity instanceof Error) {
      return entity
    }

    return entity.value.content.body
  }

  /**
   * Write content to file
   */
  async writeContent(content: string): Promise<void> {
    await this.fileSystem.writeFile(this.filePath, content)
  }

  /**
   * Write entity
   */
  async write(entity: DocFileIndexEntity<T>): Promise<void> {
    const content = entity.content.toText()

    await this.fileSystem.writeFile(this.filePath, content)
  }

  /**
   * Create new file with default content
   */
  async writeDefault(): Promise<null> {
    const dirPath = this.pathSystem.dirname(this.filePath)

    const dirName =
      this.pathSystem.basename(dirPath) ||
      this.props.config.defaultDirectoryName

    const defaultContent = [
      `# ${dirName}`,
      "",
      `Please describe the overview of ${dirName} here.`,
    ].join("\n")

    await this.fileSystem.writeFile(this.filePath, defaultContent)

    return null
  }

  /**
   * Delete file
   */
  async delete(): Promise<Error | null> {
    return await this.fileSystem.deleteFile(this.filePath)
  }

  /**
   * Check if file exists
   */
  async exists(): Promise<boolean> {
    return this.fileSystem.exists(this.filePath)
  }

  async relations(): Promise<DocFileRelationReference[]> {
    const indexFile = await this.read()

    const schema = indexFile.content.meta().schema()

    if (!schema) {
      return []
    }

    const refs: DocFileRelationReference[] = []

    const fieldKeys = Object.keys(schema) as Array<keyof T>

    for (const key of fieldKeys) {
      const fieldValue = schema.value[key]
      if (fieldValue === undefined) continue
      if (
        fieldValue.type !== "relation" &&
        fieldValue.type !== "multi-relation"
      ) {
        continue
      }
      const field = schema.field(key)
      // field should be DocSchemaFieldRelationSingleValue or DocSchemaFieldMultiRelationValue
      const fileRef = new DocFileRelationReference({
        filePath: (field as unknown as { path: string }).path,
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
      })
      refs.push(fileRef)
    }

    return refs
  }

  async readRelations(): Promise<DocRelationValue[]> {
    const relations = await this.relations()

    const files: DocRelationValue[] = []

    for (const relation of relations) {
      const entity = await relation.read()
      if (entity === null) continue
      files.push(entity)
    }

    return files
  }

  /**
   * Get file size in bytes
   */
  async size(): Promise<number> {
    return this.fileSystem.getFileSize(this.filePath)
  }

  /**
   * Get last modified date
   */
  async lastModified(): Promise<Date> {
    return this.fileSystem.getFileModifiedTime(this.filePath)
  }

  /**
   * Get file creation date
   */
  async createdAt(): Promise<Date> {
    return this.fileSystem.getFileCreatedTime(this.filePath)
  }

  /**
   * Move file to archive and return new reference
   */
  async archive(
    archiveDirectoryName = this.props.config.archiveDirectoryName,
  ): Promise<DocFileIndexReference<T>> {
    const dirPath = this.pathSystem.dirname(this.filePath)

    const fileName = this.pathSystem.basename(this.filePath)

    const archivePath = this.pathSystem.join(
      dirPath,
      archiveDirectoryName,
      fileName,
    )

    await this.fileSystem.moveFile(this.filePath, archivePath)

    return new DocFileIndexReference<T>({
      path: archivePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      customSchema: this.customSchema,
      config: this.props.config,
    })
  }

  /**
   * Restore file from archive and return new reference
   */
  async restore(
    archiveDirectoryName = this.props.config.archiveDirectoryName,
  ): Promise<DocFileIndexReference<T>> {
    const dirPath = this.pathSystem.dirname(this.filePath)

    const parentDirName = this.pathSystem.basename(dirPath)

    // Error if parent directory is not archive directory
    if (parentDirName !== archiveDirectoryName) {
      throw new Error(`File is not in archive directory: ${this.filePath}`)
    }

    const fileName = this.pathSystem.basename(this.filePath)

    const restorePath = this.pathSystem.join(
      this.pathSystem.dirname(dirPath),
      fileName,
    )

    // Move file
    await this.fileSystem.moveFile(this.filePath, restorePath)

    // Create reference with new path
    return new DocFileIndexReference<T>({
      path: restorePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      customSchema: this.customSchema,
      config: this.props.config,
    })
  }
}
