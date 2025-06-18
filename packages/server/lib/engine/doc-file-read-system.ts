import path from "node:path"
import type { DocFileSystem } from "./doc-file-system"
import { DocFileIndexEntity } from "./entities/doc-file-index-entity"
import { DocFileMdEntity } from "./entities/doc-file-md-entity"

type Props = {
  fileSystem: DocFileSystem
  indexFileName: string
  readmeFileName: string
}

/**
 * ドキュメントの読み取り操作
 */
export class DocFileReadSystem {
  private readonly fileSystem: DocFileSystem
  private readonly indexFileName: string
  private readonly readmeFileName: string

  constructor(props: Props) {
    this.fileSystem = props.fileSystem
    this.indexFileName = props.indexFileName
    this.readmeFileName = props.readmeFileName
  }

  /**
   * FileSystemインスタンスを取得
   */
  get fileSystemInstance(): DocFileSystem {
    return this.fileSystem
  }

  /**
   * ファイルの内容を読み取り
   */
  async readContent(relativePath: string): Promise<string> {
    return this.fileSystem.readFile(relativePath)
  }

  /**
   * ファイルの存在確認
   */
  async exists(relativePath: string): Promise<boolean> {
    return this.fileSystem.exists(relativePath)
  }

  /**
   * ディレクトリかどうかの確認
   */
  async isDirectory(relativePath: string): Promise<boolean> {
    return this.fileSystem.isDirectory(relativePath)
  }

  /**
   * ファイルかどうかの確認
   */
  async isFile(relativePath: string): Promise<boolean> {
    return this.fileSystem.isFile(relativePath)
  }

  /**
   * DocFileBuilderとしてファイルを読み取り
   */
  async readFile(relativePath: string): Promise<DocFileMdEntity> {
    const content = await this.fileSystem.readFile(relativePath)

    return DocFileMdEntity.from(relativePath, content)
  }

  /**
   * インデックスファイルを読み取り（DocIndexFileBuilderを使用）
   */
  async readIndexFile(directoryPath = ""): Promise<DocFileIndexEntity | null> {
    const indexPath = path.join(directoryPath, this.indexFileName)

    if (!(await this.fileSystem.exists(indexPath))) {
      return null
    }

    const markdownContent = await this.fileSystem.readFile(indexPath)

    return DocFileIndexEntity.fromMarkdown(directoryPath, markdownContent)
  }

  /**
   * ディレクトリ内のMarkdownファイル一覧を取得
   */
  async readDirectoryFiles(directoryPath = ""): Promise<string[]> {
    const entries = await this.fileSystem.readDirectory(directoryPath)
    const markdownFiles: string[] = []

    for (const entry of entries) {
      // 「_」で始まるファイル・ディレクトリは除外
      if (entry.startsWith("_")) {
        continue
      }

      const filePath = directoryPath ? path.join(directoryPath, entry) : entry

      // ディレクトリの場合はスキップ（この関数はファイルのみを対象とする）
      if (await this.fileSystem.isDirectory(filePath)) {
        continue
      }

      if (!entry.endsWith(".md")) continue

      // index.md, README.mdは除外
      if (entry === this.indexFileName || entry === this.readmeFileName) {
        continue
      }

      markdownFiles.push(filePath)
    }

    return markdownFiles
  }

  /**
   * ディレクトリ内の全ファイル（.md以外も含む）を取得
   */
  async readAllFiles(directoryPath: string): Promise<{
    markdownFiles: DocFileMdEntity[]
    otherFiles: Array<{
      path: string
      fileName: string
      extension: string
      size: number
    }>
  }> {
    const entries = await this.fileSystem.readDirectory(directoryPath)
    const markdownFiles: DocFileMdEntity[] = []
    const otherFiles: Array<{
      path: string
      fileName: string
      extension: string
      size: number
    }> = []

    for (const entry of entries) {
      const filePath = directoryPath ? path.join(directoryPath, entry) : entry

      // ディレクトリは除外
      if (await this.fileSystem.isDirectory(filePath)) {
        continue
      }

      // index.md, README.mdは除外
      if (entry === this.indexFileName || entry === this.readmeFileName) {
        continue
      }

      const extension = path.extname(entry).toLowerCase()

      if (extension === ".md") {
        // Markdownファイル
        const docFile = await this.readFile(filePath)
        markdownFiles.push(docFile)
      } else if ([".json", ".csv", ".txt"].includes(extension)) {
        // その他対応ファイル
        const fileSize = await this.fileSystem.getFileSize(filePath)
        otherFiles.push({
          path: filePath,
          fileName: path.basename(entry, extension),
          extension: extension.substring(1), // ドットを除去
          size: fileSize,
        })
      }
    }

    return { markdownFiles, otherFiles }
  }

  /**
   * 全てのMarkdownファイルを再帰的に取得
   */
  async readAllMarkdownFiles(
    directoryPath = "",
    maxDepth?: number,
  ): Promise<string[]> {
    const results: string[] = []
    await this.readAllMarkdownFilesRecursive(
      directoryPath,
      results,
      maxDepth,
      0,
    )
    return results
  }

  private async readAllMarkdownFilesRecursive(
    directoryPath: string,
    results: string[],
    maxDepth?: number,
    currentDepth = 0,
  ): Promise<void> {
    if (maxDepth !== undefined && currentDepth > maxDepth) {
      return
    }

    // 現在のディレクトリのMarkdownファイルを追加
    const files = await this.readDirectoryFiles(directoryPath)
    results.push(...files)

    // サブディレクトリを取得
    const entries = await this.fileSystem.readDirectory(directoryPath)

    for (const entry of entries) {
      // アーカイブディレクトリ（「_」で始まる）は除外
      if (entry.startsWith("_")) continue

      const entryPath = directoryPath ? path.join(directoryPath, entry) : entry
      const isDirectory = await this.fileSystem.isDirectory(entryPath)
      if (!isDirectory || !entry.endsWith(".md")) continue
      await this.readAllMarkdownFilesRecursive(
        entryPath,
        results,
        maxDepth,
        currentDepth + 1,
      )
    }
  }
}
