import fs from "node:fs/promises"
import type { DocPathSystem } from "./doc-path-system"

type Props = {
  basePath: string
  pathSystem: DocPathSystem
}

/**
 * ファイルシステム
 */
export class DocFileSystem {
  private readonly basePath: string
  private readonly pathSystem: DocPathSystem

  constructor(props: Props) {
    this.basePath = props.basePath
    this.pathSystem = props.pathSystem
  }

  /**
   * 指定されたパスのファイルの内容を読み込む
   */
  async readFile(relativePath: string): Promise<string | null> {
    const exists = await this.exists(relativePath)

    if (!exists) return null

    const fullPath = this.pathSystem.join(this.basePath, relativePath)

    try {
      return await fs.readFile(fullPath, "utf-8")
    } catch {
      return null
    }
  }

  /**
   * 指定されたパスのファイルに内容を書き込む（必要に応じてディレクトリも作成）
   */
  async writeFile(relativePath: string, content: string): Promise<void> {
    const fullPath = this.pathSystem.join(this.basePath, relativePath)
    const dirPath = this.pathSystem.dirname(fullPath)

    try {
      // ディレクトリが存在しない場合は作成
      await fs.mkdir(dirPath, { recursive: true })
      await fs.writeFile(fullPath, content, "utf-8")
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error(`Failed to write file at ${fullPath}`)
    }
  }

  /**
   * 指定されたパスのファイルを削除
   */
  async deleteFile(relativePath: string): Promise<Error | null> {
    try {
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      await fs.unlink(fullPath)
      return null
    } catch (error) {
      return new Error(`Failed to delete file at ${relativePath}: ${error}`)
    }
  }

  /**
   * 指定されたパスのファイル名を取得
   */
  readFileName(relativePath: string): string {
    return this.pathSystem.basename(relativePath)
  }

  /**
   * 指定されたパスのファイル拡張子を取得
   */
  readFileExtension(relativePath: string): string {
    return this.pathSystem.extname(relativePath)
  }

  /**
   * 指定されたパスのファイルが存在するディレクトリパスを取得
   */
  readFileDirectory(relativePath: string): string {
    return this.pathSystem.dirname(relativePath)
  }

  /**
   * ディレクトリ内のエントリ一覧を取得
   */
  async readDirectoryFileNames(relativePath = ""): Promise<string[]> {
    const fullPath = this.pathSystem.join(this.basePath, relativePath)

    try {
      return await fs.readdir(fullPath)
    } catch {
      return []
    }
  }

  async readDirectoryFilePaths(relativePath: string): Promise<string[]> {
    const fileNames = await this.readDirectoryFileNames(relativePath)

    return fileNames.map((fileName) =>
      this.pathSystem.join(relativePath, fileName),
    )
  }

  /**
   * 指定パスがディレクトリかチェック
   */
  async isDirectory(relativePath: string): Promise<boolean> {
    try {
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      const stats = await fs.stat(fullPath)
      return stats.isDirectory()
    } catch {
      return false
    }
  }

  /**
   * 指定パスがファイルかチェック
   */
  async isFile(relativePath: string): Promise<boolean> {
    try {
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      const stats = await fs.stat(fullPath)
      return stats.isFile()
    } catch {
      return false
    }
  }

  /**
   * ファイルまたはディレクトリが存在するかチェック
   */
  async exists(relativePath: string): Promise<boolean> {
    try {
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      await fs.access(fullPath)
      return true
    } catch {
      return false
    }
  }

  /**
   * ディレクトリが存在するかチェック
   */
  async directoryExists(relativePath: string): Promise<boolean> {
    return this.isDirectory(relativePath)
  }

  /**
   * ファイルが存在するかチェック
   */
  async fileExists(relativePath: string): Promise<boolean> {
    return this.isFile(relativePath)
  }

  /**
   * ベースパスを取得
   */
  getBasePath(): string {
    return this.basePath
  }

  /**
   * 相対パスを絶対パスに変換
   */
  resolve(relativePath: string): string {
    return this.pathSystem.join(this.basePath, relativePath)
  }

  /**
   * ディレクトリを作成する
   */
  async createDirectory(relativePath: string): Promise<void> {
    const fullPath = this.pathSystem.join(this.basePath, relativePath)
    await fs.mkdir(fullPath, { recursive: true })
  }

  /**
   * ファイルのサイズを取得（バイト単位）
   */
  async getFileSize(relativePath: string): Promise<number> {
    const fullPath = this.pathSystem.join(this.basePath, relativePath)
    const stats = await fs.stat(fullPath)
    return stats.size
  }

  /**
   * ディレクトリが存在しない場合は作成する
   */
  async ensureDirectoryExists(relativePath: string): Promise<void> {
    if (!(await this.exists(relativePath))) {
      await this.createDirectory(relativePath)
    }
  }

  /**
   * ファイルをコピー
   */
  async copyFile(sourcePath: string, destinationPath: string): Promise<void> {
    const sourceFullPath = this.pathSystem.join(this.basePath, sourcePath)
    const destFullPath = this.pathSystem.join(this.basePath, destinationPath)
    await fs.copyFile(sourceFullPath, destFullPath)
  }

  /**
   * ファイルを移動
   */
  async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
    const sourceFullPath = this.pathSystem.join(this.basePath, sourcePath)
    const destFullPath = this.pathSystem.join(this.basePath, destinationPath)
    await fs.rename(sourceFullPath, destFullPath)
  }

  /**
   * ファイルの最終更新日時を取得
   */
  async getFileModifiedTime(relativePath: string): Promise<Date> {
    const fullPath = this.pathSystem.join(this.basePath, relativePath)
    const stats = await fs.stat(fullPath)
    return stats.mtime
  }

  /**
   * ファイルの作成日時を取得
   */
  async getFileCreatedTime(relativePath: string): Promise<Date> {
    const fullPath = this.pathSystem.join(this.basePath, relativePath)
    const stats = await fs.stat(fullPath)
    return stats.birthtime
  }
}
