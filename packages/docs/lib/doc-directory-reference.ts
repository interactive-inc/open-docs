import { DocFileIndexReference } from "./doc-file-index-reference"
import { DocFileMdReference } from "./doc-file-md-reference"
import type { DocFileSystem } from "./doc-file-system"
import { DocFileUnknownReference } from "./doc-file-unknown-reference"
import type { DocPathSystem } from "./doc-path-system"
import { DocFileIndexEntity } from "./entities/doc-file-index-entity"
import { DocFileMdEntity } from "./entities/doc-file-md-entity"
import { DocFileUnknownEntity } from "./entities/doc-file-unknown-entity"

type Props = {
  path: string
  indexFileName: string
  archiveDirectoryName: string
  fileSystem: DocFileSystem
  pathSystem: DocPathSystem
}

/**
 * ディレクトリの参照
 */
export class DocDirectoryReference {
  private readonly pathSystem: DocPathSystem

  constructor(private readonly props: Props) {
    this.pathSystem = props.pathSystem
    Object.freeze(this)
  }

  get fileSystem() {
    return this.props.fileSystem
  }

  get basePath() {
    return this.fileSystem.getBasePath()
  }

  get relativePath() {
    return this.props.path
  }

  get absolutePath() {
    return this.pathSystem.join(this.basePath, this.relativePath)
  }

  get indexFileName() {
    return this.props.indexFileName
  }

  get indexFilePath() {
    return this.pathSystem.join(
      this.basePath,
      this.relativePath,
      this.props.indexFileName,
    )
  }

  get archiveDirectoryName() {
    return this.props.archiveDirectoryName
  }

  async fileNames() {
    const filePaths = await this.fileSystem.readDirectoryFilePaths(
      this.relativePath,
    )
    return filePaths
      .map((p) => this.pathSystem.basename(p))
      .filter((name) => name.includes("."))
  }

  async archivedFileNames() {
    const archivePath = this.pathSystem.join(
      this.relativePath,
      this.archiveDirectoryName,
    )

    const filePaths = await this.fileSystem.readDirectoryFilePaths(archivePath)

    return filePaths
      .map((p) => this.pathSystem.basename(p))
      .filter((name) => name.includes("."))
  }

  async *filesGenerator() {
    const fileNames = await this.fileNames()

    // 通常のファイルを処理
    for (const fileName of fileNames) {
      if (fileName === "index.md") continue
      if (fileName.endsWith(".md")) {
        yield new DocFileMdReference({
          path: this.pathSystem.join(this.relativePath, fileName),
          fileSystem: this.fileSystem,
          pathSystem: this.pathSystem,
        })
        continue
      }
      yield new DocFileUnknownReference({
        path: this.pathSystem.join(this.relativePath, fileName),
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
      })
    }

    // アーカイブされたファイルを処理
    const archivedFileNames = await this.archivedFileNames()
    for (const fileName of archivedFileNames) {
      if (fileName === "index.md") continue
      if (fileName.endsWith(".md")) {
        yield new DocFileMdReference({
          path: this.pathSystem.join(
            this.relativePath,
            this.archiveDirectoryName,
            fileName,
          ),
          fileSystem: this.fileSystem,
          pathSystem: this.pathSystem,
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
      })
    }
  }

  async *mdFilesGenerator() {
    const files = this.filesGenerator()

    for await (const file of files) {
      if (file instanceof DocFileMdReference) {
        yield file
      }
    }
  }

  async files() {
    const files: (DocFileMdReference | DocFileUnknownReference)[] = []

    for await (const file of this.filesGenerator()) {
      files.push(file)
    }

    return files
  }

  async mdFiles() {
    const files: DocFileMdReference[] = []

    for await (const file of this.filesGenerator()) {
      if (file instanceof DocFileUnknownReference) continue
      files.push(file)
    }

    return files
  }

  file(fileName: string): DocFileMdReference | DocFileUnknownReference {
    const filePath = this.pathSystem.join(this.relativePath, fileName)

    if (fileName.endsWith(".md")) {
      return new DocFileMdReference({
        path: filePath,
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
      })
    }

    return new DocFileUnknownReference({
      path: filePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
    })
  }

  mdFile(fileName: string): DocFileMdReference {
    return new DocFileMdReference({
      path: this.pathSystem.join(this.relativePath, fileName),
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
    })
  }

  async readFiles(): Promise<(DocFileMdEntity | DocFileUnknownEntity)[]> {
    const entities: (DocFileMdEntity | DocFileUnknownEntity)[] = []

    for await (const file of this.filesGenerator()) {
      const entity = await file.read()
      if (entity instanceof Error) continue
      entities.push(entity)
    }

    return entities
  }

  async readMdFiles(): Promise<DocFileMdEntity[]> {
    const entities: DocFileMdEntity[] = []

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

  indexFile(): DocFileIndexReference {
    return new DocFileIndexReference({
      path: this.pathSystem.join(this.relativePath, this.indexFileName),
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
    })
  }

  async readIndexFile(): Promise<DocFileIndexEntity> {
    const ref = this.indexFile()

    return ref.read()
  }

  async writeFile(
    entity: DocFileIndexEntity | DocFileUnknownEntity | DocFileMdEntity,
  ) {
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

    return await this.fileSystem.writeFile(filePath, content)
  }

  async exists(): Promise<boolean> {
    return await this.fileSystem.exists(this.relativePath)
  }

  /**
   * 一意なファイル名を生成する
   */
  private async generateUniqueFileName(prefix = "document"): Promise<string> {
    const now = new Date()
    const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, "")

    let counter = 0
    let fileName: string

    do {
      const suffix = counter > 0 ? `-${counter}` : ""
      fileName = `${prefix}-${timestamp}${suffix}.md`
      counter++
    } while (await this.fileExists(fileName))

    return fileName
  }

  /**
   * 指定されたファイル名のファイルが存在するかチェック
   */
  private async fileExists(fileName: string): Promise<boolean> {
    const filePath = this.pathSystem.join(this.relativePath, fileName)
    return await this.fileSystem.exists(filePath)
  }

  /**
   * 新しいMarkdownファイルを作成する
   */
  async createMdFile(fileName?: string): Promise<DocFileMdReference> {
    const actualFileName =
      fileName || (await this.generateUniqueFileName("document"))

    // .mdが付いていない場合は追加
    const mdFileName = actualFileName.endsWith(".md")
      ? actualFileName
      : `${actualFileName}.md`

    const filePath = this.pathSystem.join(this.relativePath, mdFileName)

    const fileRef = new DocFileMdReference({
      path: filePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
    })

    // デフォルトコンテンツでファイルを作成
    await fileRef.writeDefault()

    return fileRef
  }
}
