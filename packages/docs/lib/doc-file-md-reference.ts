import { DocDirectoryReference } from "./doc-directory-reference"
import type { DocFileSystem } from "./doc-file-system"
import type { DocPathSystem } from "./doc-path-system"
import { DocFileMdEntity } from "./entities/doc-file-md-entity"
import { DocFileContentMdValue } from "./values/doc-file-content-md-value"
import { DocFilePathValue } from "./values/doc-file-path-value"

type Props = {
  path: string
  fileSystem: DocFileSystem
  pathSystem: DocPathSystem
}

/**
 * ファイルの参照
 */
export class DocFileMdReference {
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

  get path() {
    return this.props.path
  }

  get fullPath() {
    return this.pathSystem.join(this.basePath, this.path)
  }

  get directoryPath() {
    return this.pathSystem.dirname(this.path)
  }

  get archivedPath() {
    return this.pathSystem.join(this.directoryPath, "_", this.nameWithExtension)
  }

  get name() {
    return this.pathSystem.basename(this.path, ".md")
  }

  get nameWithExtension() {
    return `${this.name}.md`
  }

  directory(): DocDirectoryReference {
    return new DocDirectoryReference({
      archiveDirectoryName: "_",
      indexFileName: "index.md",
      fileSystem: this.fileSystem,
      path: this.directoryPath,
      pathSystem: this.pathSystem,
    })
  }

  async read(): Promise<Error | DocFileMdEntity> {
    const content = await this.fileSystem.readFile(this.path)

    const actualPath = this.path

    if (content === null) {
      const content = await this.fileSystem.readFile(this.archivedPath)
      if (content !== null) {
        const contentValue = DocFileContentMdValue.fromMarkdown(content)
        const pathValue = DocFilePathValue.fromPathWithSystem(
          actualPath,
          this.pathSystem,
          this.basePath,
        )
        return new DocFileMdEntity({
          type: "markdown",
          content: contentValue.value,
          path: pathValue.value,
          isArchived: true,
        })
      }
    }

    if (content === null) {
      return new Error(`File not found at ${this.path} or in archive.`)
    }

    const contentValue = DocFileContentMdValue.fromMarkdown(content)
    const pathValue = DocFilePathValue.fromPathWithSystem(
      actualPath,
      this.pathSystem,
      this.basePath,
    )

    // アーカイブディレクトリにあるファイルかどうかをチェック
    const isInArchiveDir =
      this.path.includes("/_/") || this.path.startsWith("_/")

    return new DocFileMdEntity({
      type: "markdown",
      content: contentValue.value,
      path: pathValue.value,
      isArchived: isInArchiveDir,
    })
  }

  /**
   * ファイルの内容を読み込む
   */
  async readContent() {
    const entity = await this.read()
    if (entity instanceof Error) {
      return entity
    }
    return entity.value.content.body
  }

  /**
   * ファイルに内容を書き込む
   */
  async writeContent(content: string) {
    return await this.fileSystem.writeFile(this.path, content)
  }

  /**
   * Entityを書き込む
   */
  async write(entity: DocFileMdEntity) {
    const content = entity.content.toText()
    return await this.fileSystem.writeFile(this.path, content)
  }

  /**
   * 新しいファイルをデフォルトコンテンツで作成
   */
  async writeDefault() {
    const fileName = this.pathSystem.basename(this.path, ".md")
    const defaultContent = [
      `# ${fileName}`,
      "",
      "ここに内容を記載してください。",
    ].join("\n")
    return await this.fileSystem.writeFile(this.path, defaultContent)
  }

  /**
   * ファイルを削除
   */
  async delete() {
    return await this.fileSystem.deleteFile(this.path)
  }

  /**
   * ファイルが存在するか確認（アーカイブも含む）
   */
  async exists(): Promise<boolean> {
    // まず通常のパスを確認
    if (await this.fileSystem.exists(this.path)) {
      return true
    }

    // アーカイブディレクトリを確認
    const dirPath = this.pathSystem.dirname(this.path)
    const fileName = this.pathSystem.basename(this.path)
    const archivePath = this.pathSystem.join(dirPath, "_", fileName)

    return this.fileSystem.exists(archivePath)
  }

  /**
   * ファイルをコピー
   */
  async copyTo(destinationPath: string): Promise<void> {
    await this.fileSystem.copyFile(this.path, destinationPath)
  }

  /**
   * ファイルを移動
   */
  async moveTo(destinationPath: string): Promise<void> {
    await this.fileSystem.moveFile(this.path, destinationPath)
  }

  /**
   * ファイルのサイズを取得（バイト単位）
   */
  async size(): Promise<number> {
    return this.fileSystem.getFileSize(this.path)
  }

  /**
   * ファイルの最終更新日時を取得
   */
  async lastModified(): Promise<Date> {
    return this.fileSystem.getFileModifiedTime(this.path)
  }

  /**
   * ファイルの作成日時を取得
   */
  async createdAt(): Promise<Date> {
    return this.fileSystem.getFileCreatedTime(this.path)
  }

  /**
   * ファイルをアーカイブに移動し、新しい参照を返す
   */
  async archive(archiveDirectoryName = "_"): Promise<DocFileMdReference> {
    const dirPath = this.pathSystem.dirname(this.path)

    const fileName = this.pathSystem.basename(this.path)

    const archivePath = this.pathSystem.join(
      dirPath,
      archiveDirectoryName,
      fileName,
    )

    await this.moveTo(archivePath)

    return new DocFileMdReference({
      path: archivePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
    })
  }

  /**
   * ファイルをアーカイブから復元し、新しい参照を返す
   */
  async restore(archiveDirectoryName = "_"): Promise<DocFileMdReference> {
    const dirPath = this.pathSystem.dirname(this.path)

    const parentDirName = this.pathSystem.basename(dirPath)

    if (parentDirName !== archiveDirectoryName) {
      throw new Error(
        `ファイルはアーカイブディレクトリにありません: ${this.path}`,
      )
    }

    const fileName = this.pathSystem.basename(this.path)

    const restorePath = this.pathSystem.join(
      this.pathSystem.dirname(dirPath),
      fileName,
    )

    await this.moveTo(restorePath)

    return new DocFileMdReference({
      path: restorePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
    })
  }
}
