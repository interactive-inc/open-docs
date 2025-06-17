import path from "node:path"
import type { DocFileSystem } from "./doc-file-system"

type Props = {
  fileSystem: DocFileSystem
  indexFileName: string
}

/**
 * ドキュメントの書き込み操作
 */
export class DocFileWriteSystem {
  private readonly fileSystem: DocFileSystem
  private readonly indexFileName: string

  constructor(props: Props) {
    this.fileSystem = props.fileSystem
    this.indexFileName = props.indexFileName
  }

  /**
   * ファイルに内容を書き込み
   */
  async writeContent(relativePath: string, content: string): Promise<void> {
    return this.fileSystem.writeFile(relativePath, content)
  }

  /**
   * ファイルを削除
   */
  async deleteFile(relativePath: string): Promise<void> {
    return this.fileSystem.deleteFile(relativePath)
  }

  /**
   * 新しいファイルを作成
   */
  async createFile(directoryPath: string, fileName?: string): Promise<string> {
    const directoryExists = await this.fileSystem.exists(directoryPath)

    if (!directoryExists) {
      throw new Error(`ディレクトリが見つかりません: ${directoryPath}`)
    }

    if (!(await this.fileSystem.isDirectory(directoryPath))) {
      throw new Error(
        `指定されたパスはディレクトリではありません: ${directoryPath}`,
      )
    }

    // ファイル名が指定されていない場合は自動生成
    const finalFileName = fileName || this.generateUniqueFileName()
    const filePath = path.join(directoryPath, finalFileName)

    // ファイルが既に存在する場合はエラー
    if (await this.fileSystem.exists(filePath)) {
      throw new Error(`ファイルが既に存在します: ${filePath}`)
    }

    // デフォルトのMarkdownコンテンツ
    const defaultContent = [
      `# ${path.basename(finalFileName, ".md")}`,
      "",
      "ここに内容を記載してください。",
    ].join("\n")

    await this.fileSystem.writeFile(filePath, defaultContent)
    return filePath
  }

  /**
   * インデックスファイルを作成（ディレクトリも自動作成）
   */
  async createIndexFile(directoryPath: string): Promise<void> {
    // ディレクトリが存在しない場合は作成
    if (!(await this.fileSystem.exists(directoryPath))) {
      await this.fileSystem.ensureDirectoryExists(directoryPath)
    }

    const indexPath = path.join(directoryPath, this.indexFileName)

    const dirName = path.basename(directoryPath) || "ディレクトリ"

    const defaultContent = [
      `# ${dirName}`,
      "",
      `${dirName}に関する概要をここに記載してください。`,
    ].join("\n")

    await this.fileSystem.writeFile(indexPath, defaultContent)
  }

  /**
   * ユニークなファイル名を生成
   */
  private generateUniqueFileName(): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "")
    return `document-${timestamp}.md`
  }
}
