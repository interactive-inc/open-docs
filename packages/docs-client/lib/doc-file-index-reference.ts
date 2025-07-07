import { DocFileRelationReference } from "./doc-file-relation-reference"
import type { DocFileSystem } from "./doc-file-system"
import type { DocPathSystem } from "./doc-path-system"
import { DocFileIndexEntity } from "./entities/doc-file-index-entity"
import { DocFileContentIndexValue } from "./values/doc-file-content-index-value"
import { DocFilePathValue } from "./values/doc-file-path-value"
import type { DocRelationValue } from "./values/doc-relation-value"

type Props = {
  path: string
  fileSystem: DocFileSystem
  pathSystem: DocPathSystem
}

/**
 * ファイルを表すクラス
 */
export class DocFileIndexReference {
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

  get filePath(): string {
    return this.props.path
  }

  get fileFullPath(): string {
    return this.pathSystem.join(this.basePath, this.filePath)
  }

  get durectoryPath(): string {
    return this.pathSystem.dirname(this.filePath)
  }

  async read(): Promise<DocFileIndexEntity> {
    const content = await this.fileSystem.readFile(this.filePath)
    if (content === null) {
      const dirName = this.filePath.split("/").pop() || "directory"
      const pathValue = DocFilePathValue.fromPathWithSystem(
        this.filePath,
        this.pathSystem,
        this.fileSystem.getBasePath(),
      )
      const contentValue = DocFileContentIndexValue.empty(dirName)

      return new DocFileIndexEntity({
        type: "index",
        path: pathValue.toJson(),
        content: contentValue.toJson(),
        isArchived: false,
      })
    }

    const pathValue = DocFilePathValue.fromPathWithSystem(
      this.filePath,
      this.pathSystem,
      this.fileSystem.getBasePath(),
    )
    const contentValue = DocFileContentIndexValue.fromMarkdown(content)

    return new DocFileIndexEntity({
      type: "index",
      path: pathValue.toJson(),
      content: contentValue.toJson(),
      isArchived: false,
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
    return entity.value.content.body
  }

  /**
   * ファイルに内容を書き込む
   */
  async writeContent(content: string): Promise<void> {
    await this.fileSystem.writeFile(this.filePath, content)
  }

  /**
   * Entityを書き込む
   */
  async write(entity: DocFileIndexEntity): Promise<void> {
    const content = entity.content.toText()
    await this.fileSystem.writeFile(this.filePath, content)
  }

  /**
   * 新しいファイルをデフォルトコンテンツで作成
   */
  async writeDefault(): Promise<void> {
    const dirPath = this.pathSystem.dirname(this.filePath)
    const dirName = this.pathSystem.basename(dirPath) || "ディレクトリ"
    const defaultContent = [
      `# ${dirName}`,
      "",
      `${dirName}に関する概要をここに記載してください。`,
    ].join("\n")
    await this.fileSystem.writeFile(this.filePath, defaultContent)
  }

  /**
   * ファイルを削除
   */
  async delete(): Promise<Error | null> {
    return await this.fileSystem.deleteFile(this.filePath)
  }

  /**
   * ファイルが存在するか確認
   */
  async exists(): Promise<boolean> {
    return this.fileSystem.exists(this.filePath)
  }

  async relations(): Promise<DocFileRelationReference[]> {
    const indexFile = await this.read()

    if (indexFile instanceof Error) {
      return []
    }

    const schema = indexFile.content.frontMatter.value.schema
    if (!schema) {
      return []
    }
    const relationFields = Object.entries(schema).filter(([_key, field]) => {
      return field.type === "relation" || field.type === "multi-relation"
    })

    return relationFields.map(([, field]) => {
      if (
        (field.type === "relation" || field.type === "multi-relation") &&
        field.path
      ) {
        return new DocFileRelationReference({
          filePath: field.path,
          fileSystem: this.fileSystem,
          pathSystem: this.pathSystem,
        })
      }
      throw new Error("Unexpected field type or missing path")
    })
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
   * ファイルのサイズを取得（バイト単位）
   */
  async size(): Promise<number> {
    return this.fileSystem.getFileSize(this.filePath)
  }

  /**
   * ファイルの最終更新日時を取得
   */
  async lastModified(): Promise<Date> {
    return this.fileSystem.getFileModifiedTime(this.filePath)
  }

  /**
   * ファイルの作成日時を取得
   */
  async createdAt(): Promise<Date> {
    return this.fileSystem.getFileCreatedTime(this.filePath)
  }

  /**
   * ファイルをアーカイブに移動し、新しい参照を返す
   */
  async archive(archiveDirectoryName = "_"): Promise<DocFileIndexReference> {
    const dirPath = this.pathSystem.dirname(this.filePath)
    const fileName = this.pathSystem.basename(this.filePath)
    const archivePath = this.pathSystem.join(
      dirPath,
      archiveDirectoryName,
      fileName,
    )

    // ファイルを移動
    await this.fileSystem.moveFile(this.filePath, archivePath)

    // 新しいパスで参照を作成
    return new DocFileIndexReference({
      path: archivePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
    })
  }

  /**
   * ファイルをアーカイブから復元し、新しい参照を返す
   */
  async restore(archiveDirectoryName = "_"): Promise<DocFileIndexReference> {
    const dirPath = this.pathSystem.dirname(this.filePath)
    const parentDirName = this.pathSystem.basename(dirPath)

    // 親ディレクトリがアーカイブディレクトリでない場合はエラー
    if (parentDirName !== archiveDirectoryName) {
      throw new Error(
        `ファイルはアーカイブディレクトリにありません: ${this.filePath}`,
      )
    }

    const fileName = this.pathSystem.basename(this.filePath)
    const restorePath = this.pathSystem.join(
      this.pathSystem.dirname(dirPath),
      fileName,
    )

    // ファイルを移動
    await this.fileSystem.moveFile(this.filePath, restorePath)

    // 新しいパスで参照を作成
    return new DocFileIndexReference({
      path: restorePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
    })
  }
}
