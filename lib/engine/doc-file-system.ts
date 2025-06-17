import fs from "node:fs/promises"
import path from "node:path"

type Props = {
  basePath: string
}

/**
 * ファイルシステム
 */
export class DocFileSystem {
  private readonly basePath: string

  constructor(props: Props) {
    this.basePath = props.basePath
  }

  /**
   * 指定されたパスのファイルの内容を読み込む
   */
  async readFile(relativePath: string): Promise<string> {
    const fullPath = path.join(this.basePath, relativePath)
    return await fs.readFile(fullPath, "utf-8")
  }

  /**
   * 指定されたパスのファイルに内容を書き込む
   */
  async writeFile(relativePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.basePath, relativePath)
    await fs.writeFile(fullPath, content, "utf-8")
  }

  /**
   * 指定されたパスのファイルを削除
   */
  async deleteFile(relativePath: string): Promise<void> {
    const fullPath = path.join(this.basePath, relativePath)
    await fs.unlink(fullPath)
  }

  /**
   * 指定されたパスのファイル名を取得
   */
  getFileName(relativePath: string): string {
    return path.basename(relativePath)
  }

  /**
   * 指定されたパスのファイル拡張子を取得
   */
  getFileExtension(relativePath: string): string {
    return path.extname(relativePath)
  }

  /**
   * 指定されたパスのファイルが存在するディレクトリパスを取得
   */
  getFileDirectory(relativePath: string): string {
    return path.dirname(relativePath)
  }

  /**
   * ディレクトリ内のエントリ一覧を取得
   */
  async readDirectory(relativePath = ""): Promise<string[]> {
    const fullPath = path.join(this.basePath, relativePath)
    return await fs.readdir(fullPath)
  }

  /**
   * 指定パスがディレクトリかチェック
   */
  async isDirectory(relativePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.basePath, relativePath)
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
      const fullPath = path.join(this.basePath, relativePath)
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
      const fullPath = path.join(this.basePath, relativePath)
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
    return path.join(this.basePath, relativePath)
  }

  /**
   * ディレクトリを作成する
   */
  async createDirectory(relativePath: string): Promise<void> {
    const fullPath = path.join(this.basePath, relativePath)
    await fs.mkdir(fullPath, { recursive: true })
  }

  /**
   * ファイルのサイズを取得（バイト単位）
   */
  async getFileSize(relativePath: string): Promise<number> {
    const fullPath = path.join(this.basePath, relativePath)
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
}
