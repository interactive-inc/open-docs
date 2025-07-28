import { DocFileIndexReference } from "./doc-file-index-reference"
import { DocFileMdReference } from "./doc-file-md-reference"
import type { DocFileSystem } from "./doc-file-system"
import { DocFileUnknownReference } from "./doc-file-unknown-reference"
import type { DocPathSystem } from "./doc-path-system"
import { DocFileIndexEntity } from "./entities/doc-file-index-entity"
import { DocFileMdEntity } from "./entities/doc-file-md-entity"
import { DocFileUnknownEntity } from "./entities/doc-file-unknown-entity"
import type { DocClientConfig, DocCustomSchema } from "./types"

type Props<T extends DocCustomSchema> = {
  customSchema: T
  path: string
  indexFileName: string
  archiveDirectoryName: string
  fileSystem: DocFileSystem
  pathSystem: DocPathSystem
  config: DocClientConfig
}

/**
 * Directory reference
 */
export class DocDirectoryReference<T extends DocCustomSchema> {
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

  get config(): DocClientConfig {
    return this.props.config
  }

  get relativePath(): string {
    return this.props.path
  }

  get absolutePath(): string {
    return this.pathSystem.join(this.basePath, this.relativePath)
  }

  get indexFileName(): string {
    return this.props.indexFileName
  }

  get indexFilePath(): string {
    return this.pathSystem.join(
      this.basePath,
      this.relativePath,
      this.props.indexFileName,
    )
  }

  get archiveDirectoryName(): string {
    return this.props.archiveDirectoryName
  }

  async fileNames(): Promise<string[]> {
    const filePaths = await this.fileSystem.readDirectoryFilePaths(
      this.relativePath,
    )

    return filePaths
      .map((p) => this.pathSystem.basename(p))
      .filter((name) => name.includes("."))
  }

  async archivedFileNames(): Promise<string[]> {
    const archivePath = this.pathSystem.join(
      this.relativePath,
      this.archiveDirectoryName,
    )

    const filePaths = await this.fileSystem.readDirectoryFilePaths(archivePath)

    return filePaths
      .map((p) => this.pathSystem.basename(p))
      .filter((name) => name.includes("."))
  }

  async *filesGenerator(): AsyncGenerator<
    DocFileMdReference<T> | DocFileUnknownReference,
    void,
    unknown
  > {
    const fileNames = await this.fileNames()

    // Process regular files
    for (const fileName of fileNames) {
      if (fileName === "index.md") continue
      if (fileName.endsWith(".md")) {
        yield new DocFileMdReference({
          path: this.pathSystem.join(this.relativePath, fileName),
          fileSystem: this.fileSystem,
          pathSystem: this.pathSystem,
          customSchema: this.customSchema,
          config: this.props.config,
        })
        continue
      }
      yield new DocFileUnknownReference({
        path: this.pathSystem.join(this.relativePath, fileName),
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
        config: this.props.config,
      })
    }

    const archivedFileNames = await this.archivedFileNames()

    // Process archived files
    for (const fileName of archivedFileNames) {
      if (fileName === this.indexFileName) continue
      if (fileName.endsWith(".md")) {
        yield new DocFileMdReference({
          path: this.pathSystem.join(
            this.relativePath,
            this.archiveDirectoryName,
            fileName,
          ),
          fileSystem: this.fileSystem,
          pathSystem: this.pathSystem,
          customSchema: this.customSchema,
          config: this.props.config,
        })
        continue
      }
      yield new DocFileUnknownReference({
        path: this.pathSystem.join(
          this.relativePath,
          this.archiveDirectoryName,
          fileName,
        ),
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
        config: this.props.config,
      })
    }
  }

  async *mdFilesGenerator(): AsyncGenerator<
    DocFileMdReference<T>,
    void,
    unknown
  > {
    const generator = this.filesGenerator()

    for await (const file of generator) {
      if (file instanceof DocFileMdReference) {
        yield file
      }
    }
  }

  async files(): Promise<(DocFileMdReference<T> | DocFileUnknownReference)[]> {
    const files: (DocFileMdReference<T> | DocFileUnknownReference)[] = []

    for await (const ref of this.filesGenerator()) {
      files.push(ref)
    }

    return files
  }

  async mdFiles(): Promise<DocFileMdReference<T>[]> {
    const refs: DocFileMdReference<T>[] = []

    for await (const file of this.mdFilesGenerator()) {
      refs.push(file)
    }

    return refs
  }

  async file(
    fileName: string,
  ): Promise<DocFileMdReference<T> | DocFileUnknownReference> {
    const filePath = this.pathSystem.join(this.relativePath, fileName)

    if (fileName.endsWith(".md")) {
      return new DocFileMdReference<T>({
        path: filePath,
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
        customSchema: this.customSchema,
        config: this.props.config,
      })
    }

    return new DocFileUnknownReference({
      path: filePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      config: this.props.config,
    })
  }

  async mdFile(fileName: string): Promise<DocFileMdReference<T>> {
    return new DocFileMdReference<T>({
      path: fileName.endsWith(".md")
        ? this.pathSystem.join(this.relativePath, fileName)
        : this.pathSystem.join(this.relativePath, `${fileName}.md`),
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      customSchema: this.customSchema,
      config: this.props.config,
    })
  }

  async readFiles(): Promise<(DocFileMdEntity<T> | DocFileUnknownEntity)[]> {
    const entities: (DocFileMdEntity<T> | DocFileUnknownEntity)[] = []

    for await (const file of this.filesGenerator()) {
      const entity = await file.read()
      if (entity instanceof Error) continue
      entities.push(entity)
    }

    return entities
  }

  async readMdFiles(): Promise<DocFileMdEntity<T>[]> {
    const entities: DocFileMdEntity<T>[] = []

    for await (const file of this.filesGenerator()) {
      const entity = await file.read()
      if (entity instanceof Error) continue
      if (entity instanceof DocFileUnknownEntity) continue
      entities.push(entity)
    }

    return entities
  }

  async readUnknownFiles(): Promise<DocFileUnknownEntity[]> {
    const entities: DocFileUnknownEntity[] = []

    for await (const file of this.filesGenerator()) {
      const entity = await file.read()
      if (entity instanceof Error) continue
      if (entity instanceof DocFileMdEntity) continue
      entities.push(entity)
    }

    return entities
  }

  /**
   * Get list of subdirectory names
   */
  async directoryNames(): Promise<string[]> {
    const allFileNames = await this.fileSystem.readDirectoryFileNames(
      this.relativePath,
    )
    const directoryNames: string[] = []

    for (const fileName of allFileNames) {
      if (fileName.startsWith(this.archiveDirectoryName)) continue

      // Check if directory is in exclusion list
      if (this.props.config.directoryExcludes.includes(fileName)) continue

      const filePath = this.pathSystem.join(this.relativePath, fileName)
      const isDirectory = await this.fileSystem.isDirectory(filePath)

      if (isDirectory) {
        directoryNames.push(fileName)
      }
    }

    return directoryNames
  }

  /**
   * Get subdirectory references
   */
  async directories(): Promise<DocDirectoryReference<never>[]> {
    const directoryNames = await this.directoryNames()

    return directoryNames.map((dirName) => {
      const dirPath = this.pathSystem.join(this.relativePath, dirName)

      return new DocDirectoryReference<never>({
        path: dirPath,
        indexFileName: this.indexFileName,
        archiveDirectoryName: this.archiveDirectoryName,
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
        customSchema: {} as never,
        config: this.props.config,
      })
    })
  }

  /**
   * Get single subdirectory reference
   */
  directory(directoryName: string) {
    const dirPath = this.pathSystem.join(this.relativePath, directoryName)

    return new DocDirectoryReference({
      path: dirPath,
      indexFileName: this.indexFileName,
      archiveDirectoryName: this.archiveDirectoryName,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      customSchema: this.customSchema,
      config: this.props.config,
    })
  }

  indexFile() {
    return new DocFileIndexReference({
      path: this.pathSystem.join(this.relativePath, this.indexFileName),
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      customSchema: this.customSchema,
      config: this.props.config,
    })
  }

  async readIndexFile() {
    return this.indexFile().read()
  }

  async writeFile(
    entity: DocFileIndexEntity<T> | DocFileMdEntity<T> | DocFileUnknownEntity,
  ): Promise<Error | null> {
    const filePath = this.pathSystem.join(
      this.relativePath,
      entity.value.path.nameWithExtension,
    )

    let content: string | null = null

    if (entity instanceof DocFileUnknownEntity) {
      content = entity.value.content
    }

    if (entity instanceof DocFileIndexEntity) {
      content = entity.content.toText()
    }

    if (entity instanceof DocFileMdEntity) {
      content = entity.content.toText()
    }

    if (content === null) {
      return new Error("Entity content is undefined")
    }

    await this.fileSystem.writeFile(filePath, content)

    return null
  }

  async exists(): Promise<boolean> {
    return await this.fileSystem.exists(this.relativePath)
  }

  /**
   * Generate unique filename
   */
  private uniqueFileName(prefix = "document"): string {
    const [uuid] = crypto.randomUUID().split("-")

    return `${prefix}-${uuid}.md`
  }

  /**
   * Create new Markdown file
   */
  async createMdFile(fileName?: string): Promise<DocFileMdReference<T>> {
    const actualFileName = fileName || this.uniqueFileName("document")

    // Add .md extension if not present
    const mdFileName = actualFileName.endsWith(".md")
      ? actualFileName
      : `${actualFileName}.md`

    const filePath = this.pathSystem.join(this.relativePath, mdFileName)

    const fileRef = new DocFileMdReference({
      path: filePath,
      customSchema: this.customSchema,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      config: this.props.config,
    })

    await fileRef.writeDefault()

    return fileRef
  }
}
