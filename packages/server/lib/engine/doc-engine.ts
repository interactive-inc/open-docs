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
 * リファクタリングされたDocEngine
 */
export class DocEngine {
  private readonly docFileSystem: DocFileSystem
  private readonly docFileRead: DocFileReadSystem
  private readonly docFileWrite: DocFileWriteSystem
  private readonly docFileNormalize: DocFileNormalizeSystem
  private readonly docFileArchive: DocFileArchiveSystem
  private readonly docFileTree: DocFileTreeSystem
  private readonly docFileRelation: DocFileRelationSystem
  private readonly cocDirectory: DocDirectorySystem

  constructor(readonly props: Props) {
    this.docFileSystem = new DocFileSystem({ basePath: props.basePath })

    this.docFileRead = new DocFileReadSystem({
      fileSystem: this.docFileSystem,
      indexFileName: props.indexFileName ?? "index.md",
      readmeFileName: props.readmeFileName ?? "README.md",
    })

    this.docFileWrite = new DocFileWriteSystem({
      fileSystem: this.docFileSystem,
      indexFileName: props.indexFileName ?? "index.md",
    })

    this.docFileNormalize = new DocFileNormalizeSystem({
      reader: this.docFileRead,
      writer: this.docFileWrite,
    })

    this.docFileArchive = new DocFileArchiveSystem({
      reader: this.docFileRead,
      writer: this.docFileWrite,
    })

    this.docFileTree = new DocFileTreeSystem({
      reader: this.docFileRead,
      normalizer: this.docFileNormalize,
    })

    this.docFileRelation = new DocFileRelationSystem({
      reader: this.docFileRead,
      fileSystem: this.docFileSystem,
    })

    this.cocDirectory = new DocDirectorySystem({
      fileSystem: this.docFileSystem,
      reader: this.docFileRead,
      relationManager: this.docFileRelation,
      archiveManager: this.docFileArchive,
      writer: this.docFileWrite,
    })
  }

  /**
   * ファイルの内容を読み込む
   */
  async readFileContent(relativePath: string): Promise<string> {
    return this.docFileRead.readContent(relativePath)
  }

  /**
   * ファイルに内容を書き込む
   */
  async writeFileContent(relativePath: string, content: string): Promise<void> {
    return this.docFileWrite.writeContent(relativePath, content)
  }

  /**
   * ファイルの存在確認
   */
  async exists(relativePath: string): Promise<boolean> {
    return this.docFileRead.exists(relativePath)
  }

  /**
   * ディレクトリかどうかの確認
   */
  async isDirectory(relativePath: string): Promise<boolean> {
    return this.docFileRead.isDirectory(relativePath)
  }

  /**
   * ディレクトリ内のエントリ一覧を取得
   */
  async readDirectoryEntries(relativePath: string): Promise<string[]> {
    return this.docFileSystem.readDirectory(relativePath)
  }

  /**
   * DocFileBuilderとしてファイルを取得
   */
  async getFile(relativePath: string) {
    return this.docFileRead.readFile(relativePath)
  }

  /**
   * ディレクトリデータを取得
   */
  async readDirectory(relativePath: string): Promise<DocDirectoryEntity> {
    return this.cocDirectory.readDirectory(relativePath)
  }

  /**
   * ディレクトリのindex.mdを更新
   */
  async updateIndexFile(
    directoryPath: string,
    updates: {
      title: string | null
      description: string | null
      properties: Record<string, unknown> | null
    },
  ): Promise<void> {
    return this.cocDirectory.updateIndexFile(directoryPath, updates)
  }

  /**
   * 新しいファイルを作成
   */
  async createFile(directoryPath: string, fileName?: string): Promise<string> {
    return this.docFileWrite.createFile(directoryPath, fileName)
  }

  /**
   * ファイルを削除
   */
  async deleteFile(relativePath: string): Promise<void> {
    return this.docFileWrite.deleteFile(relativePath)
  }

  /**
   * ディレクトリ全体のindex.mdファイルを検証・作成
   */
  async validateDirectories(basePath = ""): Promise<void> {
    return this.docFileNormalize.validateDirectories(basePath)
  }

  async *normalizeFileTree(): AsyncGenerator<{
    type: "index" | "file"
    path: string
    isUpdated: boolean
  }> {
    yield* this.docFileNormalize.normalizeFileTree()
  }

  /**
   * ファイル全体を正規化
   */
  async validateFiles(basePath = ""): Promise<void> {
    return this.docFileNormalize.validateFiles(basePath)
  }

  /**
   * ファイルツリーを取得
   */
  async getFileTree(basePath = "") {
    return this.docFileTree.getFileTree(basePath)
  }

  /**
   * ファイルをアーカイブに移動
   */
  async moveFileToArchive(filePath: string): Promise<string> {
    return this.docFileArchive.moveFileToArchive(filePath)
  }

  /**
   * ファイルをアーカイブから復元
   */
  async restoreFileFromArchive(archiveFilePath: string): Promise<string> {
    return this.docFileArchive.restoreFileFromArchive(archiveFilePath)
  }

  /**
   * アーカイブディレクトリかどうかの判定
   */
  isArchiveDirectory(directoryPath: string): boolean {
    return this.docFileArchive.isArchiveDirectory(directoryPath)
  }

  /**
   * アーカイブされたファイル一覧を取得
   */
  async getArchivedFiles(basePath: string) {
    return this.docFileArchive.getArchivedFiles(basePath)
  }

  /**
   * アーカイブ情報付きでディレクトリを読み取り
   */
  async readDirectoryWithArchiveHandling(basePath: string) {
    return this.docFileArchive.readDirectoryWithArchiveHandling(basePath)
  }
}
