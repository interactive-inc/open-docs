import fs from "node:fs/promises"
import path from "node:path"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import { OpenFile } from "./open-file"

type Props = {
  basePath: string
}

/**
 * ファイルシステム操作のベースクラス
 */
export class OpenFileSystem {
  private readonly basePath: string

  /**
   * OpenFileSystemを初期化する
   */
  constructor(props: Props) {
    this.basePath = props.basePath
  }

  /**
   * 指定されたパスのファイルオブジェクトを作成
   */
  file(relativePath: string): OpenFile {
    const fullPath = path.join(this.basePath, relativePath)
    return new OpenFile(fullPath)
  }

  /**
   * ディレクトリ内のエントリ一覧を取得
   */
  async readDirectory(relativePath = ""): Promise<string[]> {
    const fullPath = path.join(this.basePath, relativePath)
    return await fs.readdir(fullPath)
  }

  /**
   * ディレクトリ内のMarkdownファイル一覧を取得
   */
  async readMarkdownFiles(
    relativePath = "",
    options?: { exclude?: string[] },
  ): Promise<OpenFile[]> {
    const entries = await this.readDirectory(relativePath)
    const markdownFiles: OpenFile[] = []
    const excludeFiles = options?.exclude || []

    for (const entry of entries) {
      if (entry.endsWith(".md") && !excludeFiles.includes(entry)) {
        const filePath = relativePath ? path.join(relativePath, entry) : entry
        markdownFiles.push(this.file(filePath))
      }
    }

    return markdownFiles
  }

  /**
   * ディレクトリ内のMarkdownファイルをコンテンツ付きで取得
   */
  async readMarkdownFilesWithContent(
    relativePath = "",
    options?: { exclude?: string[] },
  ): Promise<
    Array<{
      file: OpenFile
      frontMatter: Record<string, unknown>
      content: string
    }>
  > {
    const markdownFiles = await this.readMarkdownFiles(relativePath, options)
    const results: Array<{
      file: OpenFile
      frontMatter: Record<string, unknown>
      content: string
    }> = []

    for (const file of markdownFiles) {
      const markdownContent = await file.readContent()
      const openMarkdown = new OpenMarkdown(markdownContent)
      results.push({
        file,
        frontMatter: openMarkdown.frontMatter.data || {},
        content: openMarkdown.content,
      })
    }

    return results
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
}
