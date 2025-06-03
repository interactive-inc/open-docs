import fs from "node:fs/promises"
import path from "node:path"

/**
 * ファイル操作を行うクラス
 */
export class OpenFile {
  /**
   * OpenFileを初期化する
   */
  constructor(private readonly filePath: string) {}

  /**
   * ファイルの内容を読み込む
   */
  async readContent(): Promise<string> {
    return await fs.readFile(this.filePath, "utf-8")
  }

  /**
   * ファイルに内容を書き込む
   */
  async writeContent(content: string): Promise<void> {
    await fs.writeFile(this.filePath, content, "utf-8")
  }

  /**
   * ファイルが存在するかチェック
   */
  async exists(): Promise<boolean> {
    try {
      await fs.access(this.filePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * ファイルかチェック
   */
  async isFile(): Promise<boolean> {
    try {
      const stats = await fs.stat(this.filePath)
      return stats.isFile()
    } catch {
      return false
    }
  }

  /**
   * ディレクトリかチェック
   */
  async isDirectory(): Promise<boolean> {
    try {
      const stats = await fs.stat(this.filePath)
      return stats.isDirectory()
    } catch {
      return false
    }
  }

  /**
   * ファイルパスを取得
   */
  getPath(): string {
    return this.filePath
  }

  /**
   * ファイル名を取得
   */
  getName(): string {
    return path.basename(this.filePath)
  }

  /**
   * ファイル拡張子を取得
   */
  getExtension(): string {
    return path.extname(this.filePath)
  }

  /**
   * ファイルが存在するディレクトリパスを取得
   */
  getDirectory(): string {
    return path.dirname(this.filePath)
  }

  /**
   * ファイルを削除
   */
  async delete(): Promise<void> {
    await fs.unlink(this.filePath)
  }
}
