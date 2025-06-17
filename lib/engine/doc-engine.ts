import { DocDirectorySystem } from "./doc-directory-system"
import { DocFileArchiveSystem } from "./doc-file-archive-system"
import { DocFileNormalizeSystem } from "./doc-file-normalize-system"
import { DocFileReadSystem } from "./doc-file-read-system"
import { DocFileRelationSystem } from "./doc-file-relation-system"
import { DocFileSystem } from "./doc-file-system"
import { DocFileTreeSystem } from "./doc-file-tree-system"
import { DocFileWriteSystem } from "./doc-file-write-system"
import type { DocDirectoryEntity } from "./entities/doc-directory-entity"

type Props = {
  basePath: string
  indexFileName?: string | null
  readmeFileName?: string | null
}

/**
 * リファクタリングされたDocEngine - 責務を分離したクラス群を協調させる
 */
export class DocEngine {
  private readonly fileSystem: DocFileSystem
  private readonly reader: DocFileReadSystem
  private readonly writer: DocFileWriteSystem
  private readonly normalizer: DocFileNormalizeSystem
  private readonly archiveManager: DocFileArchiveSystem
  private readonly treeBuilder: DocFileTreeSystem
  private readonly relationManager: DocFileRelationSystem
  private readonly directoryManager: DocDirectorySystem

  constructor(readonly props: Props) {
    this.fileSystem = new DocFileSystem({ basePath: props.basePath })

    this.reader = new DocFileReadSystem({
      fileSystem: this.fileSystem,
      indexFileName: props.indexFileName ?? "index.md",
      readmeFileName: props.readmeFileName ?? "README.md",
    })

    this.writer = new DocFileWriteSystem({
      fileSystem: this.fileSystem,
      indexFileName: props.indexFileName ?? "index.md",
    })

    this.normalizer = new DocFileNormalizeSystem({
      reader: this.reader,
      writer: this.writer,
    })

    this.archiveManager = new DocFileArchiveSystem({
      reader: this.reader,
      writer: this.writer,
    })

    this.treeBuilder = new DocFileTreeSystem({
      reader: this.reader,
      normalizer: this.normalizer,
    })

    this.relationManager = new DocFileRelationSystem({
      reader: this.reader,
      fileSystem: this.fileSystem,
    })

    this.directoryManager = new DocDirectorySystem({
      fileSystem: this.fileSystem,
      reader: this.reader,
      relationManager: this.relationManager,
      archiveManager: this.archiveManager,
    })
  }

  /**
   * ファイルの内容を読み込む
   */
  async readFileContent(relativePath: string): Promise<string> {
    return this.reader.readContent(relativePath)
  }

  /**
   * ファイルに内容を書き込む
   */
  async writeFileContent(relativePath: string, content: string): Promise<void> {
    return this.writer.writeContent(relativePath, content)
  }

  /**
   * ファイルの存在確認
   */
  async exists(relativePath: string): Promise<boolean> {
    return this.reader.exists(relativePath)
  }

  /**
   * ディレクトリかどうかの確認
   */
  async isDirectory(relativePath: string): Promise<boolean> {
    return this.reader.isDirectory(relativePath)
  }

  /**
   * ディレクトリ内のエントリ一覧を取得
   */
  async readDirectoryEntries(relativePath: string): Promise<string[]> {
    return this.fileSystem.readDirectory(relativePath)
  }

  /**
   * DocFileBuilderとしてファイルを取得
   */
  async getFile(relativePath: string) {
    return this.reader.readFile(relativePath)
  }

  /**
   * ディレクトリデータを取得
   */
  async readDirectory(relativePath: string): Promise<DocDirectoryEntity> {
    return this.directoryManager.readDirectory(relativePath)
  }

  /**
   * 新しいファイルを作成
   */
  async createFile(directoryPath: string, fileName?: string): Promise<string> {
    return this.writer.createFile(directoryPath, fileName)
  }

  /**
   * ファイルを削除
   */
  async deleteFile(relativePath: string): Promise<void> {
    return this.writer.deleteFile(relativePath)
  }

  /**
   * ディレクトリ全体のindex.mdファイルを検証・作成
   */
  async validateDirectories(basePath = ""): Promise<void> {
    return this.normalizer.validateDirectories(basePath)
  }

  async *normalizeFileTree(): AsyncGenerator<{
    type: "index" | "file"
    path: string
    isUpdated: boolean
  }> {
    yield* this.normalizer.normalizeFileTree()
  }

  /**
   * ファイル全体を正規化
   */
  async validateFiles(basePath = ""): Promise<void> {
    return this.normalizer.validateFiles(basePath)
  }

  /**
   * ファイルツリーを取得
   */
  async getFileTree(basePath = "") {
    return this.treeBuilder.getFileTree(basePath)
  }

  /**
   * ファイルをアーカイブに移動
   */
  async moveFileToArchive(filePath: string): Promise<string> {
    return this.archiveManager.moveFileToArchive(filePath)
  }

  /**
   * ファイルをアーカイブから復元
   */
  async restoreFileFromArchive(archiveFilePath: string): Promise<string> {
    return this.archiveManager.restoreFileFromArchive(archiveFilePath)
  }

  /**
   * アーカイブディレクトリかどうかの判定
   */
  isArchiveDirectory(directoryPath: string): boolean {
    return this.archiveManager.isArchiveDirectory(directoryPath)
  }

  /**
   * アーカイブされたファイル一覧を取得
   */
  async getArchivedFiles(basePath: string) {
    return this.archiveManager.getArchivedFiles(basePath)
  }

  /**
   * アーカイブ情報付きでディレクトリを読み取り
   */
  async readDirectoryWithArchiveHandling(basePath: string) {
    return this.archiveManager.readDirectoryWithArchiveHandling(basePath)
  }
}
