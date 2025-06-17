import path from "node:path"
import { zDocFileUnknown } from "@/lib/models"
import type { DocFileReadSystem } from "./doc-file-read-system"
import type { DocFileWriteSystem } from "./doc-file-write-system"

type Props = {
  reader: DocFileReadSystem
  writer: DocFileWriteSystem
  archivePrefix?: string
}

/**
 * アーカイブ機能を担当
 */
export class DocFileArchiveSystem {
  private readonly reader: DocFileReadSystem
  private readonly writer: DocFileWriteSystem
  private readonly archivePrefix: string

  constructor(props: Props) {
    this.reader = props.reader
    this.writer = props.writer
    this.archivePrefix = props.archivePrefix ?? "_"
  }

  /**
   * アーカイブディレクトリかどうかの判定
   */
  isArchiveDirectory(directoryPath: string): boolean {
    const dirName = path.basename(directoryPath)
    return dirName.startsWith(this.archivePrefix)
  }

  /**
   * アーカイブディレクトリのパスを生成
   */
  getArchiveDirectoryPath(basePath: string): string {
    return path.join(basePath, this.archivePrefix)
  }

  /**
   * ファイルをアーカイブに移動
   */
  async moveFileToArchive(filePath: string): Promise<string> {
    const directory = path.dirname(filePath)

    const fileName = path.basename(filePath)

    const archiveDir = this.getArchiveDirectoryPath(directory)

    const archivePath = path.join(archiveDir, fileName)

    const isDirectory = await this.reader.isDirectory(archiveDir)

    if (!isDirectory) {
      await this.writer.createIndexFile(archiveDir)
    }

    // ファイルの内容を読み取り
    const content = await this.reader.readContent(filePath)

    // アーカイブ場所に書き込み
    await this.writer.writeContent(archivePath, content)

    // 元ファイルを削除
    await this.writer.deleteFile(filePath)

    return archivePath
  }

  /**
   * ファイルをアーカイブから復元
   */
  async restoreFileFromArchive(archiveFilePath: string): Promise<string> {
    const archiveDir = path.dirname(archiveFilePath)
    const fileName = path.basename(archiveFilePath)
    const baseDir = path.dirname(archiveDir)
    const restorePath = path.join(baseDir, fileName)

    // ファイルの内容を読み取り
    const content = await this.reader.readContent(archiveFilePath)

    // 復元場所に書き込み
    await this.writer.writeContent(restorePath, content)

    // アーカイブファイルを削除
    await this.writer.deleteFile(archiveFilePath)

    return restorePath
  }

  /**
   * アーカイブディレクトリ内のファイル一覧を取得
   */
  async getArchivedFiles(basePath: string) {
    const archiveDir = this.getArchiveDirectoryPath(basePath)

    const exists = await this.reader.exists(archiveDir)

    if (!exists) {
      return []
    }

    const files = await this.reader.readDirectoryFiles(archiveDir)

    const filesWithSize = await Promise.all(
      files.map(async (filePath) => {
        const fileSize =
          await this.reader.fileSystemInstance.getFileSize(filePath)
        return zDocFileUnknown.parse({
          path: filePath,
          fileName: path.basename(filePath),
          extension: path.extname(filePath).slice(1) || "md",
          size: fileSize,
        })
      }),
    )

    return filesWithSize
  }

  /**
   * アーカイブディレクトリ付きでディレクトリを読み取り
   */
  async readDirectoryWithArchiveHandling(basePath: string) {
    const archiveDir = this.getArchiveDirectoryPath(basePath)
    const hasArchive = await this.reader.exists(archiveDir)

    if (hasArchive) {
      const archiveFiles = await this.getArchivedFiles(basePath)
      return { hasArchive: true, archiveFiles }
    }

    return { hasArchive: false, archiveFiles: [] }
  }
}
