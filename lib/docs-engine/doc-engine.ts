import path from "node:path"
import { DocFileSystem } from "@/lib/docs-engine/doc-file-system"
import type {
  DocsEngineProps,
  MarkdownFileData,
} from "@/lib/docs-engine/models"
import { zAppFileFrontMatter } from "@/lib/docs-engine/models"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import { DocDirectory } from "./doc-directory"
import { DocFile } from "./doc-file"
import { DocFileFrontMatter } from "./models/doc-file-front-matter"

/**
 * Docsディレクトリのファイルシステムエンジン
 */
export class DocEngine {
  private readonly indexFileName: string
  private readonly readmeFileName: string

  constructor(
    readonly props: DocsEngineProps,
    readonly deps = {
      fileSystem: new DocFileSystem({ basePath: props.basePath }),
    },
  ) {
    this.indexFileName = props.indexFileName || "index.md"
    this.readmeFileName = props.readmeFileName || "README.md"
  }

  /**
   * ファイルの内容を読み込む
   */
  async readFileContent(relativePath: string): Promise<string> {
    return this.deps.fileSystem.readFile(relativePath)
  }

  /**
   * ファイルに内容を書き込む
   */
  async writeFileContent(relativePath: string, content: string): Promise<void> {
    return this.deps.fileSystem.writeFile(relativePath, content)
  }

  /**
   * ファイルが存在するかチェック
   */
  async fileExists(relativePath: string): Promise<boolean> {
    return this.deps.fileSystem.fileExists(relativePath)
  }

  /**
   * ファイルの絶対パスを取得
   */
  getFilePath(relativePath: string): string {
    return this.deps.fileSystem.resolve(relativePath)
  }

  /**
   * ファイルを削除
   */
  async deleteFile(relativePath: string): Promise<void> {
    return this.deps.fileSystem.deleteFile(relativePath)
  }

  /**
   * OpenMarkdownインスタンスを作成する
   */
  markdown(text: string): OpenMarkdown {
    return new OpenMarkdown(text)
  }

  /**
   * インデックスファイル（index.md）のパスを取得する
   */
  indexFilePath(directoryPath = ""): string {
    const indexPath = directoryPath
      ? path.join(directoryPath, this.indexFileName)
      : this.indexFileName
    return indexPath
  }

  /**
   * 指定されたディレクトリにインデックスファイルが存在するかチェックする
   */
  async hasIndexFile(directoryPath = ""): Promise<boolean> {
    const indexPath = this.indexFilePath(directoryPath)
    return this.deps.fileSystem.fileExists(indexPath)
  }

  /**
   * インデックスファイルを読み込む
   */
  async readIndexFile(directoryPath = ""): Promise<DocFile | null> {
    const indexPath = this.indexFilePath(directoryPath)

    const exists = await this.deps.fileSystem.fileExists(indexPath)

    if (!exists) {
      return null
    }

    const fileContent = await this.deps.fileSystem.readFile(indexPath)

    const openMarkdown = this.markdown(fileContent)

    const fullPath = this.deps.fileSystem.resolve(indexPath)

    return new DocFile({
      content: openMarkdown.content,
      filePath: fullPath,
      frontMatter: DocFileFrontMatter.from(openMarkdown.frontMatter.data ?? {}),
      title: openMarkdown.title,
    })
  }

  /**
   * READMEファイル（README.md）のパスを取得する
   */
  readmeFilePath(directoryPath = ""): string {
    const readmePath = directoryPath
      ? path.join(directoryPath, this.readmeFileName)
      : this.readmeFileName
    return readmePath
  }

  /**
   * 指定されたディレクトリにREADMEファイルが存在するかチェックする
   */
  async hasReadmeFile(directoryPath = ""): Promise<boolean> {
    const readmePath = this.readmeFilePath(directoryPath)
    return this.deps.fileSystem.fileExists(readmePath)
  }

  /**
   * ディレクトリ内のMarkdownファイル一覧を取得する
   */
  async readDirectoryFiles(directoryPath = ""): Promise<string[]> {
    const entries = await this.deps.fileSystem.readDirectory(directoryPath)
    const markdownFiles: string[] = []

    for (const entry of entries) {
      if (!entry.endsWith(".md")) continue
      const filePath = directoryPath ? path.join(directoryPath, entry) : entry
      markdownFiles.push(filePath)
    }

    return markdownFiles
  }

  /**
   * コンテンツ付きでMarkdownファイルを取得
   */
  async readMarkdownContents(directoryPath = ""): Promise<MarkdownFileData[]> {
    const markdownFiles = await this.readDirectoryFiles(directoryPath)
    const results: MarkdownFileData[] = []

    for (const filePath of markdownFiles) {
      const fileContent = await this.deps.fileSystem.readFile(filePath)
      const openMarkdown = this.markdown(fileContent)

      // frontMatterのバリデーション
      const parsedFrontMatter = zAppFileFrontMatter.safeParse(
        openMarkdown.frontMatter.data || {},
      )

      results.push({
        filePath: filePath,
        frontMatter: parsedFrontMatter.success ? parsedFrontMatter.data : {},
        content: openMarkdown.content,
        title: openMarkdown.title,
      })
    }

    return results
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
    const entries = await this.deps.fileSystem.readDirectory(directoryPath)

    for (const entry of entries) {
      const entryPath = directoryPath ? path.join(directoryPath, entry) : entry
      const isDirectory = await this.deps.fileSystem.isDirectory(entryPath)
      if (!isDirectory || !entry.endsWith(".md")) continue
      await this.readAllMarkdownFilesRecursive(
        entryPath,
        results,
        maxDepth,
        currentDepth + 1,
      )
    }
  }

  /**
   * ベースパスを取得
   */
  getBasePath(): string {
    return this.deps.fileSystem.getBasePath()
  }

  /**
   * 相対パスを絶対パスに変換
   */
  resolve(relativePath: string): string {
    return this.deps.fileSystem.resolve(relativePath)
  }

  /**
   * ファイルまたはディレクトリが存在するかチェック
   */
  async exists(relativePath: string): Promise<boolean> {
    return this.deps.fileSystem.exists(relativePath)
  }

  /**
   * 指定パスがファイルかチェック
   */
  async isFile(relativePath: string): Promise<boolean> {
    return this.deps.fileSystem.isFile(relativePath)
  }

  /**
   * 指定パスがディレクトリかチェック
   */
  async isDirectory(relativePath: string): Promise<boolean> {
    return this.deps.fileSystem.isDirectory(relativePath)
  }

  /**
   * ファイルデータを取得する
   */
  async getFile(relativePath: string): Promise<DocFile> {
    const content = await this.deps.fileSystem.readFile(relativePath)
    const openMarkdown = this.markdown(content)
    const fullPath = this.deps.fileSystem.resolve(relativePath)

    return new DocFile({
      content: openMarkdown.content,
      filePath: fullPath,
      frontMatter: DocFileFrontMatter.from(openMarkdown.frontMatter.data ?? {}),
      title: openMarkdown.title,
    })
  }

  /**
   * ディレクトリデータ取得
   */
  async getDirectory(relativePath: string): Promise<DocDirectory> {
    const indexFile = await this.readIndexFile(relativePath)

    const fullPath = this.resolve(relativePath)

    if (indexFile) {
      return DocDirectory.fromDocFile(fullPath, indexFile)
    }

    return DocDirectory.empty(fullPath)
  }

  /**
   * ファイルまたはディレクトリデータを取得する
   */
  async getDirectoryOrFile(
    relativePath: string,
  ): Promise<DocFile | DocDirectory> {
    if (await this.isFile(relativePath)) {
      return this.getFile(relativePath)
    }

    return this.getDirectory(relativePath)
  }
}
