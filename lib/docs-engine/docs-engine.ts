import path from "node:path"
import type { OpenFile } from "@/lib/open-file-system/open-file"
import { OpenFileSystem } from "@/lib/open-file-system/open-file-system"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import { directoryFrontMatterSchema } from "@/lib/validations/directory-front-matter-schema"

type Props = {
  basePath: string
  indexFileName?: string
  readmeFileName?: string
}

type MarkdownFileData = {
  file: OpenFile
  frontMatter: Record<string, unknown>
  content: string
}

/**
 * Docsディレクトリのファイルシステムエンジン
 */
export class DocsEngine {
  private readonly indexFileName: string
  private readonly readmeFileName: string

  /**
   * DocsEngineを初期化する
   */
  constructor(
    readonly props: Props,
    readonly deps = {
      fileSystem: new OpenFileSystem({ basePath: props.basePath }),
    },
  ) {
    this.indexFileName = props.indexFileName || "index.md"
    this.readmeFileName = props.readmeFileName || "README.md"
  }

  /**
   * 指定されたパスのファイルオブジェクトを取得する
   */
  file(relativePath: string): OpenFile {
    return this.deps.fileSystem.file(relativePath)
  }

  /**
   * OpenMarkdownインスタンスを作成する
   */
  markdown(text: string): OpenMarkdown {
    return new OpenMarkdown(text)
  }

  /**
   * インデックスファイル（index.md）のファイルオブジェクトを取得する
   */
  indexFile(directoryPath = ""): OpenFile {
    const indexPath = directoryPath
      ? path.join(directoryPath, this.indexFileName)
      : this.indexFileName
    return this.file(indexPath)
  }

  /**
   * 指定されたディレクトリにインデックスファイルが存在するかチェックする
   */
  async hasIndexFile(directoryPath = ""): Promise<boolean> {
    const indexFile = this.indexFile(directoryPath)
    return indexFile.exists()
  }

  /**
   * インデックスファイルを読み込む
   */
  async readIndexFile(directoryPath = ""): Promise<{
    exists: boolean
    frontMatter?: Record<string, unknown>
    content?: string
  }> {
    try {
      const indexFile = this.indexFile(directoryPath)
      if (await indexFile.exists()) {
        const fileContent = await indexFile.readContent()
        const openMarkdown = this.markdown(fileContent)
        const { frontMatter, content } = {
          frontMatter: openMarkdown.frontMatter.data,
          content: openMarkdown.content,
        }
        return { exists: true, frontMatter: frontMatter || undefined, content }
      }
    } catch {
      // エラーの場合
    }
    return { exists: false }
  }

  /**
   * READMEファイル（README.md）のファイルオブジェクトを取得する
   */
  readmeFile(directoryPath = ""): OpenFile {
    const readmePath = directoryPath
      ? path.join(directoryPath, this.readmeFileName)
      : this.readmeFileName
    return this.file(readmePath)
  }

  /**
   * 指定されたディレクトリにREADMEファイルが存在するかチェックする
   */
  async hasReadmeFile(directoryPath = ""): Promise<boolean> {
    const readmeFile = this.readmeFile(directoryPath)
    return readmeFile.exists()
  }

  /**
   * READMEファイルを読み込む
   */
  async readReadmeFile(directoryPath = ""): Promise<{
    exists: boolean
    frontMatter?: Record<string, unknown>
    content?: string
  }> {
    try {
      const readmeFile = this.readmeFile(directoryPath)
      if (await readmeFile.exists()) {
        const fileContent = await readmeFile.readContent()
        const openMarkdown = this.markdown(fileContent)
        const { frontMatter, content } = {
          frontMatter: openMarkdown.frontMatter.data,
          content: openMarkdown.content,
        }
        return { exists: true, frontMatter: frontMatter || undefined, content }
      }
    } catch {
      // エラーの場合
    }
    return { exists: false }
  }

  /**
   * ディレクトリ内のMarkdownファイル一覧を取得する
   */
  async readMarkdownFiles(
    directoryPath = "",
    options?: {
      includeIndex?: boolean
      includeReadme?: boolean
      exclude?: string[]
    },
  ): Promise<OpenFile[]> {
    const entries = await this.deps.fileSystem.readDirectory(directoryPath)
    const markdownFiles: OpenFile[] = []

    const excludeFiles = options?.exclude || []
    if (!options?.includeIndex) {
      excludeFiles.push(this.indexFileName)
    }
    if (!options?.includeReadme) {
      excludeFiles.push(this.readmeFileName)
    }

    for (const entry of entries) {
      if (entry.endsWith(".md") && !excludeFiles.includes(entry)) {
        const filePath = directoryPath ? path.join(directoryPath, entry) : entry
        markdownFiles.push(this.file(filePath))
      }
    }

    return markdownFiles
  }

  /**
   * コンテンツ付きでMarkdownファイルを取得
   */
  async readMarkdownFilesWithContent(
    directoryPath = "",
    options?: {
      includeIndex?: boolean
      includeReadme?: boolean
      exclude?: string[]
    },
  ): Promise<MarkdownFileData[]> {
    const markdownFiles = await this.readMarkdownFiles(directoryPath, options)
    const results: MarkdownFileData[] = []

    for (const file of markdownFiles) {
      const fileContent = await file.readContent()
      const openMarkdown = this.markdown(fileContent)
      results.push({
        file,
        frontMatter: openMarkdown.frontMatter.data || {},
        content: openMarkdown.content,
      })
    }

    return results
  }

  /**
   * 全てのMarkdownファイルを再帰的に取得
   */
  async readAllMarkdownFiles(
    directoryPath = "",
    options?: {
      includeIndex?: boolean
      includeReadme?: boolean
      exclude?: string[]
      maxDepth?: number
    },
  ): Promise<OpenFile[]> {
    const results: OpenFile[] = []
    await this.readAllMarkdownFilesRecursive(directoryPath, results, options, 0)
    return results
  }

  private async readAllMarkdownFilesRecursive(
    directoryPath: string,
    results: OpenFile[],
    options?: {
      includeIndex?: boolean
      includeReadme?: boolean
      exclude?: string[]
      maxDepth?: number
    },
    currentDepth = 0,
  ): Promise<void> {
    if (options?.maxDepth !== undefined && currentDepth > options.maxDepth) {
      return
    }

    // 現在のディレクトリのMarkdownファイルを追加
    const files = await this.readMarkdownFiles(directoryPath, options)
    results.push(...files)

    // サブディレクトリを取得
    const entries = await this.deps.fileSystem.readDirectory(directoryPath)

    for (const entry of entries) {
      const entryPath = directoryPath ? path.join(directoryPath, entry) : entry
      if (await this.deps.fileSystem.isDirectory(entryPath)) {
        await this.readAllMarkdownFilesRecursive(
          entryPath,
          results,
          options,
          currentDepth + 1,
        )
      }
    }
  }

  /**
   * ディレクトリ構造を取得
   */
  async getDirectoryStructure(directoryPath = ""): Promise<{
    path: string
    hasIndex: boolean
    hasReadme: boolean
    markdownCount: number
    subdirectories: string[]
  }> {
    const entries = await this.deps.fileSystem.readDirectory(directoryPath)
    const subdirectories: string[] = []

    // サブディレクトリを判定
    for (const entry of entries) {
      const entryPath = directoryPath ? path.join(directoryPath, entry) : entry
      if (await this.deps.fileSystem.isDirectory(entryPath)) {
        subdirectories.push(entry)
      }
    }

    const hasIndex = await this.hasIndexFile(directoryPath)
    const hasReadme = await this.hasReadmeFile(directoryPath)
    const markdownFiles = await this.readMarkdownFiles(directoryPath)

    return {
      path: directoryPath,
      hasIndex,
      hasReadme,
      markdownCount: markdownFiles.length,
      subdirectories,
    }
  }

  /**
   * Front matterを検索
   */
  async searchByFrontMatter(
    searchFn: (frontMatter: Record<string, unknown>) => boolean,
    directoryPath = "",
  ): Promise<MarkdownFileData[]> {
    const allFiles = await this.readAllMarkdownFiles(directoryPath, {
      includeIndex: true,
      includeReadme: true,
    })

    const results: MarkdownFileData[] = []

    for (const file of allFiles) {
      const fileContent = await file.readContent()
      const openMarkdown = this.markdown(fileContent)
      if (
        openMarkdown.frontMatter.data &&
        searchFn(openMarkdown.frontMatter.data)
      ) {
        results.push({
          file,
          frontMatter: openMarkdown.frontMatter.data,
          content: openMarkdown.content,
        })
      }
    }

    return results
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
   * ディレクトリデータ取得（GetDirectoryDataServiceの機能を統合）
   */
  async getDirectoryData(relativePath: string): Promise<{
    isFile: boolean
    content?: string
    filePath?: string
    schema?: Record<string, unknown> | null
    title?: string | null
    description?: string | null
    indexPath?: string
    files?: Array<{
      path: string
      frontMatter: Record<string, unknown> | null
      content: string
    }>
  }> {
    if (!relativePath) {
      throw new Error("Path is required")
    }

    // ファイルの場合
    if (await this.isFile(relativePath)) {
      const targetFile = this.file(relativePath)
      const content = await targetFile.readContent()
      return {
        isFile: true,
        content,
        filePath: targetFile.getPath(),
      }
    }

    // ディレクトリの場合
    let schema = null
    let title = null
    let description = null

    const indexData = await this.readIndexFile(relativePath)
    const indexExists = indexData.exists

    if (indexData.exists && indexData.frontMatter) {
      try {
        const validatedFrontMatter = directoryFrontMatterSchema.parse(
          indexData.frontMatter,
        )
        schema = validatedFrontMatter.schema
        title = validatedFrontMatter.title
        description = validatedFrontMatter.description
      } catch {
        // バリデーションエラーの場合は生の値を使用
        const frontMatter = indexData.frontMatter as Record<string, unknown>
        schema = frontMatter.schema as Record<string, unknown> | null
        title = frontMatter.title as string | null
        description = frontMatter.description as string | null
      }
    }

    // ディレクトリ内のMarkdownファイルを取得
    const files: Array<{
      path: string
      frontMatter: Record<string, unknown> | null
      content: string
    }> = []

    try {
      const markdownFilesWithContent = await this.readMarkdownFilesWithContent(
        relativePath,
        {
          includeIndex: false,
          includeReadme: false,
        },
      )

      for (const { file, frontMatter, content } of markdownFilesWithContent) {
        files.push({
          path: file.getPath().replace(process.cwd() + path.sep, ""),
          frontMatter,
          content,
        })
      }
    } catch {
      // ディレクトリが存在しない場合はスキップ
    }

    const indexPath = indexExists
      ? path.join(
          this.getBasePath().replace(process.cwd() + path.sep, ""),
          relativePath,
          this.indexFileName,
        )
      : undefined

    return {
      isFile: false,
      schema,
      title,
      description,
      indexPath,
      files,
    }
  }
}
