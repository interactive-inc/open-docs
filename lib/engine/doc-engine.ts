import path from "node:path"
import { DocFileSystem } from "@/lib/engine/doc-file-system"
import {
  appFileFrontMatterSchema,
  appFileSchema,
  directorySchema,
  fileNodeSchema,
} from "@/lib/models"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import type { DocsEngineProps, MarkdownFileData } from "@/lib/types"
import type { z } from "zod"
import { DocFileBuilder } from "./doc-file-builder"
import { DocFrontMatterBuilder } from "./doc-front-matter-builder"
import { DocIndexFileBuilder } from "./doc-index-file-builder"

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
    this.indexFileName = props.indexFileName ?? "index.md"
    this.readmeFileName = props.readmeFileName ?? "README.md"
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
   * ファイルを保存する（AppEngine用）
   */
  async saveFile(relativePath: string, content: string): Promise<void> {
    return this.writeFileContent(relativePath, content)
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
  async readIndexFile(directoryPath = ""): Promise<DocFileBuilder | null> {
    const indexPath = this.indexFilePath(directoryPath)

    const exists = await this.deps.fileSystem.fileExists(indexPath)

    if (!exists) {
      return null
    }

    const fileContent = await this.deps.fileSystem.readFile(indexPath)

    const openMarkdown = this.markdown(fileContent)

    const fullPath = this.deps.fileSystem.resolve(indexPath)

    return new DocFileBuilder({
      content: openMarkdown.content,
      filePath: fullPath,
      frontMatter: DocFrontMatterBuilder.from(fileContent),
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
      const parsedFrontMatter = appFileFrontMatterSchema.safeParse(
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
   * ファイルデータを取得する（読み取り専用、スキーマ検証付き）
   */
  async readFile(relativePath: string) {
    const content = await this.deps.fileSystem.readFile(relativePath)
    const openMarkdown = this.markdown(content)
    const fullPath = this.deps.fileSystem.resolve(relativePath)

    // スキーマベースでFrontMatterを補完
    const rawFrontMatter = openMarkdown.frontMatter.data ?? {}
    const completeFrontMatter = await this.getCompleteFrontMatterForFile(
      relativePath,
      rawFrontMatter,
    )

    // DocFileBuilderを作成してdescriptionを計算
    const docFileBuilder = new DocFileBuilder({
      content: openMarkdown.content,
      filePath: fullPath,
      frontMatter: DocFrontMatterBuilder.fromData(completeFrontMatter),
      title: openMarkdown.title,
    })

    // models.tsのappFileSchemaで検証してJSONで返す
    const responseData = {
      path: `docs/${relativePath}`,
      frontMatter: completeFrontMatter,
      content: openMarkdown.content,
      cwd: process.cwd(),
      title: openMarkdown.title || null,
      description: docFileBuilder.description,
    }

    return appFileSchema.parse(responseData)
  }

  /**
   * ファイルデータを取得する（修正用、Builderクラスを返す）
   */
  async getFile(relativePath: string): Promise<DocFileBuilder> {
    const content = await this.deps.fileSystem.readFile(relativePath)
    const openMarkdown = this.markdown(content)
    const fullPath = this.deps.fileSystem.resolve(relativePath)

    // スキーマベースでFrontMatterを補完
    const rawFrontMatter = openMarkdown.frontMatter.data ?? {}
    const completeFrontMatter = await this.getCompleteFrontMatterForFile(
      relativePath,
      rawFrontMatter,
    )

    return new DocFileBuilder({
      content: openMarkdown.content,
      filePath: fullPath,
      frontMatter: DocFrontMatterBuilder.fromData(completeFrontMatter),
      title: openMarkdown.title,
    })
  }

  /**
   * ディレクトリデータ取得（読み取り専用、スキーマ検証付き）
   */
  async readDirectory(relativePath: string) {
    const indexFile = await this.readIndexFile(relativePath)
    const fullPath = this.resolve(relativePath)

    if (indexFile === null) {
      throw new Error(`Index file not found at path: ${fullPath}`)
    }

    const directoryName = relativePath.split("/").pop() || relativePath

    const indexFileBuilder = DocIndexFileBuilder.fromDocFile(
      fullPath,
      indexFile,
    )

    return directorySchema.parse({
      indexFile: {
        path: indexFileBuilder.indexPath,
        fileName: "index.md",
        content: indexFileBuilder.content,
        title: indexFileBuilder.title,
        description: indexFileBuilder.description,
        directoryName,
        columns: indexFileBuilder.getTableColumns(),
        frontMatter: indexFileBuilder.frontMatter.toJSON(),
      },
      files: await this.getDirectoryFiles(relativePath),
      markdownFilePaths: (await this.readDirectoryFiles(relativePath)).map(
        (f) => f,
      ),
      cwd: process.cwd(),
      relations: await this.getRelationsFromSchema(indexFileBuilder.schema),
    })
  }

  /**
   * ディレクトリデータ取得（修正用、Builderクラスを返す）
   */
  async getIndexFile(relativePath: string): Promise<DocIndexFileBuilder> {
    const indexFile = await this.readIndexFile(relativePath)

    const fullPath = this.resolve(relativePath)

    if (indexFile === null) {
      throw new Error(`Index file not found at path: ${fullPath}`)
    }

    return DocIndexFileBuilder.fromDocFile(fullPath, indexFile)
  }

  /**
   * ファイルまたはディレクトリデータを取得する
   */
  async getDirectoryOrFile(
    relativePath: string,
  ): Promise<DocFileBuilder | DocIndexFileBuilder> {
    if (await this.isFile(relativePath)) {
      return this.getFile(relativePath)
    }

    return this.getIndexFile(relativePath)
  }

  /**
   * スキーマベースでFrontMatterを補完する（内部用）
   */
  private async getCompleteFrontMatterForFile(
    filePath: string,
    rawFrontMatter: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const directoryPath = path.dirname(filePath)

    const directoryExists = await this.exists(directoryPath)
    if (!directoryExists) {
      return rawFrontMatter
    }

    const directoryData = await this.getIndexFile(directoryPath)
    if (
      !directoryData.schema ||
      Object.keys(directoryData.schema).length === 0
    ) {
      return rawFrontMatter
    }

    const schema = directoryData.schema
    const defaultFrontMatter: Record<string, unknown> = {}
    for (const [key, field] of Object.entries(schema)) {
      const fieldDef = field as { type: string; default?: unknown }
      defaultFrontMatter[key] =
        DocFrontMatterBuilder.generateDefaultValueFromSchemaField(fieldDef)
    }

    // 既存の値が存在する場合はデフォルト値で上書きしない
    const result = { ...defaultFrontMatter }
    for (const key in rawFrontMatter) {
      if (rawFrontMatter[key] !== undefined && rawFrontMatter[key] !== null) {
        result[key] = rawFrontMatter[key]
      }
    }
    return result
  }

  /**
   * スキーマベースでFrontMatterを補完する（互換性のため保持）
   */
  async getCompleteFrontMatter(
    filePath: string,
  ): Promise<Record<string, unknown>> {
    const content = await this.deps.fileSystem.readFile(filePath)
    const openMarkdown = this.markdown(content)
    const rawFrontMatter = openMarkdown.frontMatter.data ?? {}

    return this.getCompleteFrontMatterForFile(filePath, rawFrontMatter)
  }

  /**
   * 値を指定された型に変換する（デフォルト値フォールバック付き）
   */
  private convertValue(
    value: unknown,
    targetType: string,
    defaultValue: unknown,
  ): unknown {
    // null や undefined の場合はデフォルト値を使用
    if (value === null || value === undefined) {
      return defaultValue
    }

    try {
      switch (targetType) {
        case "string": {
          if (typeof value === "string") return value
          if (typeof value === "number") return String(value)
          if (typeof value === "boolean") return String(value)
          return defaultValue
        }

        case "number": {
          if (typeof value === "number") return value
          if (typeof value === "string") {
            const parsed = Number(value)
            return Number.isNaN(parsed) ? defaultValue : parsed
          }
          if (typeof value === "boolean") return value ? 1 : 0
          return defaultValue
        }

        case "boolean": {
          if (typeof value === "boolean") return value
          if (typeof value === "string") {
            const lower = value.toLowerCase()
            if (lower === "true" || lower === "1") return true
            if (lower === "false" || lower === "0") return false
            return defaultValue
          }
          if (typeof value === "number") return value !== 0
          return defaultValue
        }

        case "multi-string":
        case "array": {
          if (Array.isArray(value)) return value
          if (typeof value === "string") {
            // カンマ区切り文字列を配列に変換
            return value.split(",").map((item) => item.trim())
          }
          return defaultValue
        }

        case "multi-number": {
          if (Array.isArray(value)) {
            return value.map((item) => {
              const num = Number(item)
              return Number.isNaN(num) ? 0 : num
            })
          }
          if (typeof value === "string") {
            return value.split(",").map((item) => {
              const num = Number(item.trim())
              return Number.isNaN(num) ? 0 : num
            })
          }
          return defaultValue
        }

        case "multi-boolean": {
          if (Array.isArray(value)) {
            return value.map((item) => Boolean(item))
          }
          if (typeof value === "string") {
            return value.split(",").map((item) => {
              const trimmed = item.trim().toLowerCase()
              return trimmed === "true" || trimmed === "1"
            })
          }
          return defaultValue
        }

        case "relation": {
          if (typeof value === "string") return value
          if (value === null || value === undefined) return defaultValue
          return defaultValue
        }

        case "multi-relation": {
          if (Array.isArray(value)) {
            return value.filter((item) => typeof item === "string")
          }
          if (typeof value === "string") {
            return value.split(",").map((item) => item.trim())
          }
          return defaultValue
        }

        default:
          return defaultValue
      }
    } catch {
      return defaultValue
    }
  }

  /**
   * 単一ファイルのFrontMatterを正規化
   */
  async normalizeFile(
    relativePath: string,
    schema: Record<string, unknown> | null,
  ): Promise<boolean> {
    const content = await this.readFileContent(relativePath)

    const markdown = new OpenMarkdown(content)

    const originalFrontMatter = markdown.frontMatter.data || {}

    // スキーマにないプロパティを除外し、スキーマの順序で並び替え
    const normalizedFrontMatter: Record<string, unknown> = {}

    // まずスキーマに定義されたプロパティを追加
    if (schema) {
      for (const [key, field] of Object.entries(schema)) {
        const fieldDef = field as {
          type: string
          default?: unknown
        }

        // デフォルト値を決定
        let defaultValue: unknown
        if (Object.hasOwn(fieldDef, "default")) {
          defaultValue = fieldDef.default
        } else {
          // 従来のデフォルト値生成ロジック
          if (fieldDef.type === "string") {
            defaultValue = ""
          } else if (fieldDef.type === "boolean") {
            defaultValue = false
          } else if (fieldDef.type === "number") {
            defaultValue = 0
          } else if (
            fieldDef.type === "array" ||
            fieldDef.type === "multi-string" ||
            fieldDef.type === "multi-number" ||
            fieldDef.type === "multi-boolean" ||
            fieldDef.type === "multi-relation"
          ) {
            defaultValue = []
          } else if (fieldDef.type === "relation") {
            defaultValue = null
          } else {
            defaultValue = null
          }
        }

        // 値の変換と設定
        if (Object.hasOwn(originalFrontMatter, key)) {
          normalizedFrontMatter[key] = this.convertValue(
            originalFrontMatter[key],
            fieldDef.type,
            defaultValue,
          )
        } else {
          normalizedFrontMatter[key] = defaultValue
        }
      }
    }

    // ファイル内容を整形（trim + 末尾改行）
    const trimmedContent = markdown.content.trim()
    const formattedContent = trimmedContent ? `${trimmedContent}\n` : ""

    // 最終的なマークダウンテキストを生成
    const updatedMarkdown = OpenMarkdown.fromProps({
      frontMatter: normalizedFrontMatter,
      content: formattedContent,
    })
    const finalText = `${updatedMarkdown.text.trim()}\n`

    // 元のファイル内容を読み取って比較
    const originalFileContent = await this.readFileContent(relativePath)

    // 実際に変更があった場合のみファイルを更新
    if (originalFileContent !== finalText) {
      await this.writeFileContent(relativePath, finalText)
      return true
    }

    return false
  }

  /**
   * index.mdファイルのFrontMatterを正規化（iconとschemaのみ保持）
   */
  async normalizeIndexFile(indexPath: string): Promise<boolean> {
    const indexContent = await this.readFileContent(indexPath)
    const indexMarkdown = new OpenMarkdown(indexContent)
    const indexFrontMatter = indexMarkdown.frontMatter.data || {}

    // index.mdはiconとschemaを保持し、その他を正規化
    const normalizedIndexFrontMatter: Record<string, unknown> = {}

    // iconを追加（存在しない場合はデフォルト値）
    if (Object.hasOwn(indexFrontMatter, "icon")) {
      normalizedIndexFrontMatter.icon = indexFrontMatter.icon
    } else {
      normalizedIndexFrontMatter.icon = "📁"
    }

    // schemaを追加（存在する場合のみ）
    if (Object.hasOwn(indexFrontMatter, "schema")) {
      normalizedIndexFrontMatter.schema = indexFrontMatter.schema
    }

    // ファイル内容を整形（trim + 末尾改行）
    const trimmedContent = indexMarkdown.content.trim()
    const formattedContent = trimmedContent ? `${trimmedContent}\n` : ""

    // 最終的なマークダウンテキストを生成
    const updatedIndexMarkdown = OpenMarkdown.fromProps({
      frontMatter: normalizedIndexFrontMatter,
      content: formattedContent,
    })
    const finalText = `${updatedIndexMarkdown.text.trim()}\n`

    // 元のファイル内容を読み取って比較
    const originalFileContent = await this.readFileContent(indexPath)

    // 実際に変更があった場合のみファイルを更新
    if (originalFileContent !== finalText) {
      await this.writeFileContent(indexPath, finalText)
      return true
    }

    return false
  }

  /**
   * ディレクトリ全体のFrontMatterを正規化 (Generator版)
   */
  async *normalizeDirectoryFiles(
    directoryPath: string,
    schema: Record<string, unknown> | null,
  ): AsyncGenerator<{
    type: "index" | "file"
    path: string
    isUpdated: boolean
  }> {
    // index.mdを正規化
    const indexPath = path.join(directoryPath, "index.md")

    if (await this.exists(indexPath)) {
      const updated = await this.normalizeIndexFile(indexPath)
      yield { type: "index", path: indexPath, isUpdated: updated }
    }

    // ディレクトリ内のMarkdownファイルを正規化
    if (schema === null) return

    const markdownFiles = await this.readDirectoryFiles(directoryPath)

    for (const markdownFile of markdownFiles) {
      if (
        markdownFile.endsWith("index.md") ||
        markdownFile.endsWith("README.md")
      ) {
        continue
      }

      const updated = await this.normalizeFile(markdownFile, schema)

      yield { type: "file", path: markdownFile, isUpdated: updated }
    }
  }

  /**
   * リレーション情報を収集
   */
  async getRelationsFromSchema(schema: Record<string, unknown> | null): Promise<
    Array<{
      path: string
      files: Array<{
        value: string
        label: string
        path: string
      }>
    }>
  > {
    const relations: Array<{
      path: string
      files: Array<{
        value: string
        label: string
        path: string
      }>
    }> = []

    if (!schema) return relations

    const uniqueRelationPaths = new Set<string>()

    for (const field of Object.values(schema)) {
      const fieldDef = field as {
        type: string
        path?: string
      }

      if (
        (fieldDef.type === "relation" || fieldDef.type === "multi-relation") &&
        fieldDef.path &&
        !uniqueRelationPaths.has(fieldDef.path)
      ) {
        uniqueRelationPaths.add(fieldDef.path)

        // リレーションパスが存在するかチェック
        if (await this.exists(fieldDef.path)) {
          const relationFiles = await this.readDirectoryFiles(fieldDef.path)

          const relationOptions = []
          for (const filePath of relationFiles) {
            if (
              filePath.endsWith("index.md") ||
              filePath.endsWith("README.md")
            ) {
              continue
            }

            const docFile = await this.getFile(filePath)

            relationOptions.push({
              value: filePath,
              label:
                docFile.title ||
                filePath.split("/").pop()?.replace(".md", "") ||
                filePath,
              path: filePath,
            })
          }

          relations.push({
            path: fieldDef.path,
            files: relationOptions,
          })
        }
      }
    }

    return relations
  }

  /**
   * スキーマからデフォルトのFrontMatterを生成する
   */
  private async generateDefaultFrontMatterFromSchema(
    directoryPath: string,
  ): Promise<Record<string, unknown>> {
    const defaultFrontMatter: Record<string, unknown> = {}

    try {
      const directoryData = await this.getIndexFile(directoryPath)
      const schema = directoryData.schema

      if (schema) {
        for (const [key, field] of Object.entries(schema)) {
          const fieldDef = field as { type: string; default?: unknown }
          defaultFrontMatter[key] =
            DocFrontMatterBuilder.generateDefaultValueFromSchemaField(fieldDef)
        }
      }
    } catch (error) {
      // スキーマ取得に失敗しても続行
    }

    return defaultFrontMatter
  }

  /**
   * ファイルツリー正規化を実行（結果を消費するだけ）
   */
  async init(basePath = ""): Promise<void> {
    for await (const _result of this.normalizeFileTree(basePath)) {
      // 結果を消費するだけ（ログは不要）
    }
  }

  /**
   * ディレクトリツリー全体のFrontMatterを再帰的に正規化 (Generator版)
   */
  async *normalizeFileTree(basePath = ""): AsyncGenerator<{
    type: "index" | "file"
    path: string
    isUpdated: boolean
  }> {
    const entries = await this.deps.fileSystem.readDirectory(basePath)

    for (const entry of entries) {
      const entryPath = path.join(basePath, entry)

      const isDirectory = await this.isDirectory(entryPath)

      if (!isDirectory) continue

      // ディレクトリからスキーマを取得
      let directorySchema: Record<string, unknown> | null = null

      if (await this.hasIndexFile(entryPath)) {
        const docDirectory = await this.getIndexFile(entryPath)
        directorySchema = docDirectory.schema
      }

      const files = this.normalizeDirectoryFiles(entryPath, directorySchema)

      // 現在のディレクトリを正規化
      for await (const result of files) {
        yield result
      }

      const subDirectories = this.normalizeFileTree(entryPath)

      // サブディレクトリを再帰的に処理
      for await (const result of subDirectories) {
        yield result
      }
    }
  }

  /**
   * ディレクトリのファイル一覧を取得（index.md、README.mdを除外）
   */
  async getDirectoryFiles(directoryPath: string) {
    const markdownContents = await this.readMarkdownContents(directoryPath)

    return markdownContents
      .filter(
        (file) =>
          !(file.filePath as string).endsWith("README.md") &&
          !(file.filePath as string).endsWith("index.md"),
      )
      .map((file) => {
        const docFile = new DocFileBuilder({
          content: file.content,
          filePath: `docs/${file.filePath as string}`,
          frontMatter: DocFrontMatterBuilder.fromData(
            (file.frontMatter as Record<string, unknown>) || {},
          ),
          title: (file.title as string) || "",
        })

        return docFile.toDirectoryFile()
      })
  }

  /**
   * ファイルツリーを再帰的に取得（スキーマ検証付き）
   */
  async getFileTree(basePath = "") {
    await this.init(basePath)

    const entries = await this.deps.fileSystem.readDirectory(basePath)

    const results: z.infer<typeof fileNodeSchema>[] = []

    for (const entry of entries) {
      const entryPath = basePath ? path.join(basePath, entry) : entry

      const isDirectory = await this.isDirectory(entryPath)

      if (!isDirectory) {
        const fileNode = fileNodeSchema.parse({
          name: entry,
          path: `docs/${entryPath}`,
          type: "file",
          children: null,
          icon: undefined,
        })

        results.push(fileNode)

        continue
      }

      let icon: string | null = null

      const hasIndexFile = await this.hasIndexFile(entryPath)

      if (hasIndexFile) {
        try {
          const docDirectory = await this.getIndexFile(entryPath)
          icon = docDirectory.icon
        } catch (error) {
          console.error(`Error reading directory ${entryPath}:`, error)
        }
      }

      const children = await this.getFileTree(entryPath)

      const directoryNode = fileNodeSchema.parse({
        name: entry,
        path: `docs/${entryPath}`,
        type: "directory",
        children,
        icon: icon || undefined,
      })

      results.push(directoryNode)
    }

    return results
  }

  /**
   * 新しいファイルを作成
   */
  async createFile(directoryPath: string) {
    const directoryExists = await this.exists(directoryPath)

    if (!directoryExists) {
      throw new Error(`ディレクトリが見つかりません: ${directoryPath}`)
    }

    const entries = await this.deps.fileSystem.readDirectory(directoryPath)

    const draftFiles = entries.filter((f) => f.match(/^draft-\d{2}\.md$/))

    let nextNumber = 0
    if (draftFiles.length > 0) {
      const numbers = draftFiles.map((f) => {
        const match = f.match(/^draft-(\d{2})\.md$/)
        return match?.[1] ? Number.parseInt(match[1], 10) : 0
      })
      nextNumber = Math.max(...numbers) + 1
    }

    const fileName = `draft-${String(nextNumber).padStart(2, "0")}.md`
    const filePath = path.join(directoryPath, fileName)

    // ファイルの存在確認
    const exists = await this.fileExists(filePath)
    if (exists) {
      throw new Error(`ファイルが既に存在します: ${filePath}`)
    }

    // ディレクトリのスキーマからデフォルトのFrontMatterを生成
    const defaultFrontMatter =
      await this.generateDefaultFrontMatterFromSchema(directoryPath)

    // ファイル名からタイトルを生成
    const title = fileName.replace(/\.md$/, "")

    // 新しいMarkdownコンテンツを作成
    const openMarkdown = OpenMarkdown.fromProps({
      frontMatter: defaultFrontMatter,
      content: `# ${title}\n\n[ここに説明を入力]`,
    })

    // ファイルを書き込み
    await this.writeFileContent(filePath, openMarkdown.text)

    // 作成したファイルを読み込んで返す
    return this.readFile(filePath)
  }

  /**
   * ディレクトリ名が「_」で始まるかどうかをチェック
   */
  isArchiveDirectory(directoryPath: string): boolean {
    const dirName = path.basename(directoryPath)
    return dirName === "_" || dirName.startsWith("_")
  }

  /**
   * アーカイブディレクトリのパスを生成
   */
  getArchiveDirectoryPath(parentDirectory: string): string {
    return path.join(parentDirectory, "_")
  }

  /**
   * アーカイブディレクトリが存在するかチェック、なければ作成
   */
  async ensureArchiveDirectory(parentDirectory: string): Promise<string> {
    const archivePath = this.getArchiveDirectoryPath(parentDirectory)
    
    if (!(await this.exists(archivePath))) {
      await this.deps.fileSystem.createDirectory(archivePath)
    }
    
    return archivePath
  }

  /**
   * ファイルをアーカイブディレクトリに移動
   */
  async moveFileToArchive(filePath: string): Promise<string> {
    const parentDirectory = path.dirname(filePath)
    const fileName = path.basename(filePath)
    
    // アーカイブディレクトリを確保
    const archivePath = await this.ensureArchiveDirectory(parentDirectory)
    
    // 移動先パス
    const destinationPath = path.join(archivePath, fileName)
    
    // ファイルが既に存在する場合は連番をつける
    let finalDestinationPath = destinationPath
    let counter = 1
    
    while (await this.exists(finalDestinationPath)) {
      const nameWithoutExt = fileName.replace(/\.md$/, "")
      finalDestinationPath = path.join(archivePath, `${nameWithoutExt}_${counter}.md`)
      counter++
    }
    
    // ファイルを移動
    await this.moveFile(filePath, finalDestinationPath)
    
    return finalDestinationPath
  }

  /**
   * ファイルを移動
   */
  async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
    // ファイル内容を読み取り
    const content = await this.readFileContent(sourcePath)
    
    // 移動先ディレクトリを確保
    const destinationDir = path.dirname(destinationPath)
    if (!(await this.exists(destinationDir))) {
      await this.deps.fileSystem.createDirectory(destinationDir)
    }
    
    // 新しい場所に書き込み
    await this.writeFileContent(destinationPath, content)
    
    // 元のファイルを削除
    await this.deps.fileSystem.deleteFile(sourcePath)
  }

  /**
   * ディレクトリ読み込み時にアーカイブディレクトリを特別扱い
   */
  async readDirectoryWithArchiveHandling(directoryPath: string): Promise<{
    regularFiles: string[]
    archiveFiles: string[]
    hasArchive: boolean
  }> {
    const files = await this.readDirectoryFiles(directoryPath)
    const archivePath = this.getArchiveDirectoryPath(directoryPath)
    const hasArchive = await this.exists(archivePath)
    
    let archiveFiles: string[] = []
    if (hasArchive) {
      try {
        archiveFiles = await this.readDirectoryFiles(archivePath)
      } catch {
        // アーカイブディレクトリが読めない場合は空配列
        archiveFiles = []
      }
    }
    
    return {
      regularFiles: files,
      archiveFiles,
      hasArchive
    }
  }
}
