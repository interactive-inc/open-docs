import { DocDirectoryReference } from "./doc-directory-reference"
import type { DocFileSystem } from "./doc-file-system"
import type { DocPathSystem } from "./doc-path-system"
import { DocFileMdEntity } from "./entities/doc-file-md-entity"
import { DocFileUnknownEntity } from "./entities/doc-file-unknown-entity"
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

  directory(): DocDirectoryReference {
    return new DocDirectoryReference({
      archiveDirectoryName: "_",
      indexFileName: "index.md",
      fileSystem: this.fileSystem,
      path: this.directoryPath,
      pathSystem: this.pathSystem,
    })
  }

  async read(): Promise<Error | DocFileMdEntity | DocFileUnknownEntity> {
    const content = await this.fileSystem.readFile(this.path)

    if (content === null) {
      return new Error(`File not found at ${this.path}.`)
    }

    // アーカイブディレクトリにあるファイルかどうかをチェック
    const isInArchiveDir =
      this.path.includes("/_/") || this.path.startsWith("_/")

    if (this.path.endsWith(".md")) {
      const contentValue = DocFileContentMdValue.fromMarkdown(content)
      const pathValue = DocFilePathValue.fromPathWithSystem(
        this.path,
        this.pathSystem,
        this.basePath,
      )
      return new DocFileMdEntity({
        type: "markdown",
        content: contentValue.value,
        path: pathValue.value,
        isArchived: isInArchiveDir,
      })
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
   * ファイルの内容を読み込む
   */
  async readContent(): Promise<Error | string> {
    const entity = await this.read()
    if (entity instanceof Error) {
      return entity
    }
    if (typeof entity.value.content === "string") {
      return entity.value.content
    }
    return entity.value.content.body
  }

  /**
   * ファイルに内容を書き込む
   */
  async writeContent(content: string): Promise<void> {
    await this.fileSystem.writeFile(this.path, content)
  }

  /**
   * Entityを書き込む
   */
  async write(entity: DocFileUnknownEntity): Promise<void> {
    await this.fileSystem.writeFile(this.path, entity.value.content)
  }

  /**
   * 生のコンテンツを書き込む
   */
  async writeRaw(content: string): Promise<void> {
    await this.fileSystem.writeFile(this.path, content)
  }

  /**
   * ファイルを削除
   */
  async delete(): Promise<Error | null> {
    return await this.fileSystem.deleteFile(this.path)
  }

  /**
   * ファイルが存在するか確認
   */
  async exists(): Promise<boolean> {
    return this.fileSystem.exists(this.path)
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
  async archive(archiveDirectoryName = "_"): Promise<DocFileUnknownReference> {
    const dirPath = this.pathSystem.dirname(this.path)
    const fileName = this.pathSystem.basename(this.path)
    const archivePath = this.pathSystem.join(
      dirPath,
      archiveDirectoryName,
      fileName,
    )

    // ファイルを移動
    await this.moveTo(archivePath)

    // 新しいパスで参照を作成
    return new DocFileUnknownReference({
      path: archivePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
    })
  }

  /**
   * ファイルをアーカイブから復元し、新しい参照を返す
   */
  async restore(archiveDirectoryName = "_"): Promise<DocFileUnknownReference> {
    const dirPath = this.pathSystem.dirname(this.path)
    const parentDirName = this.pathSystem.basename(dirPath)

    // 親ディレクトリがアーカイブディレクトリでない場合はエラー
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

    // ファイルを移動
    await this.moveTo(restorePath)

    // 新しいパスで参照を作成
    return new DocFileUnknownReference({
      path: restorePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
    })
  }
}
