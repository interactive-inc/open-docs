import type { DocFileArchiveSystem } from "./doc-file-archive-system"
import type { DocFileReadSystem } from "./doc-file-read-system"
import type { DocFileRelationSystem } from "./doc-file-relation-system"
import type { DocFileSystem } from "./doc-file-system"
import { DocDirectoryEntity } from "./entities/doc-directory-entity"
import type { DocFileMdEntity } from "./entities/doc-file-md-entity"

type Props = {
  fileSystem: DocFileSystem
  reader: DocFileReadSystem
  relationManager: DocFileRelationSystem
  archiveManager: DocFileArchiveSystem
}

/**
 * ディレクトリ処理を担当するシステム
 */
export class DocDirectorySystem {
  private readonly fileSystem: DocFileSystem
  private readonly reader: DocFileReadSystem
  private readonly relationManager: DocFileRelationSystem
  private readonly archiveManager: DocFileArchiveSystem

  constructor(props: Props) {
    this.fileSystem = props.fileSystem
    this.reader = props.reader
    this.relationManager = props.relationManager
    this.archiveManager = props.archiveManager
  }

  /**
   * ディレクトリデータを取得
   */
  async readDirectory(relativePath: string): Promise<DocDirectoryEntity> {
    // パスの存在確認
    if (!(await this.reader.exists(relativePath))) {
      throw new Error(`ディレクトリが見つかりません: ${relativePath}`)
    }

    // ディレクトリであることを確認
    if (!(await this.reader.isDirectory(relativePath))) {
      throw new Error(
        `指定されたパスはディレクトリではありません: ${relativePath}`,
      )
    }

    // アーカイブディレクトリの場合は親ディレクトリを対象とする
    const targetPath = this.archiveManager.isArchiveDirectory(relativePath)
      ? relativePath.split("/").slice(0, -1).join("/") || ""
      : relativePath

    const indexFileEntity = await this.reader.readIndexFile(targetPath)

    const fullPath = this.fileSystem.resolve(targetPath)

    if (indexFileEntity === null) {
      throw new Error(`Index file not found at path: ${fullPath}`)
    }

    const allFiles = await this.reader.readAllFiles(targetPath)

    const markdownFilePaths = await this.reader.readDirectoryFiles(targetPath)

    // リレーション情報を取得
    const relations =
      await this.relationManager.getRelationsFromIndexFile(indexFileEntity)

    const archiveHandling =
      await this.archiveManager.readDirectoryWithArchiveHandling(targetPath)

    const archivedFilesList =
      await this.archiveManager.getArchivedFiles(targetPath)

    const archivedFiles: DocFileMdEntity[] = []

    // archivedFilesをDocFileEntityに変換（.mdファイルのみ）
    for (const archivedFile of archivedFilesList) {
      if (archivedFile.extension !== "md") continue
      const fileExists = await this.fileSystem.exists(archivedFile.path)
      if (!fileExists) continue
      const docFile = await this.reader.readFile(archivedFile.path)
      archivedFiles.push(docFile)
    }

    return new DocDirectoryEntity({
      indexFile: indexFileEntity.toJson(),
      files: allFiles.markdownFiles.map((file) => file.toJson()),
      otherFiles: allFiles.otherFiles,
      archivedFiles: archivedFiles.map((file) => file.toJson()),
      markdownFilePaths,
      relations: relations.map((entity) => entity.toJson()),
      hasArchive: archiveHandling.hasArchive,
      archiveFileCount: archiveHandling.archiveFiles.length,
      cwd: process.cwd(),
    })
  }
}
