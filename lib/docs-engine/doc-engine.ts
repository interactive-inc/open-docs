import path from "node:path"
import { DocFileSystem } from "@/lib/docs-engine/doc-file-system"
import type { DocsEngineProps } from "@/lib/docs-engine/models/docs-engine-props"
import type { MarkdownFileData } from "@/lib/docs-engine/models/markdown-file-data"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import { zAppFileFrontMatter } from "@/system/models/app-file-front-matter"
import { DocDirectory } from "./doc-directory"
import { DocFile } from "./doc-file"
// import { DocFileFrontMatter } from "./doc-file-front-matter"

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
      frontMatter: { data: openMarkdown.frontMatter.data ?? {} },
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
   * ファイルデータを取得する（スキーマベースでFrontMatterを補完）
   */
  async getFile(relativePath: string): Promise<DocFile> {
    const content = await this.deps.fileSystem.readFile(relativePath)
    const openMarkdown = this.markdown(content)
    const fullPath = this.deps.fileSystem.resolve(relativePath)

    // スキーマベースでFrontMatterを補完
    const rawFrontMatter = openMarkdown.frontMatter.data ?? {}
    const completeFrontMatter = await this.getCompleteFrontMatterForFile(
      relativePath,
      rawFrontMatter,
    )

    return new DocFile({
      content: openMarkdown.content,
      filePath: fullPath,
      frontMatter: { data: completeFrontMatter },
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

    const directoryData = await this.getDirectory(directoryPath)
    if (
      !directoryData.schema ||
      Object.keys(directoryData.schema).length === 0
    ) {
      return rawFrontMatter
    }

    const schema = directoryData.schema
    const defaultFrontMatter: Record<string, unknown> = {}
    for (const [key, field] of Object.entries(schema)) {
      if (field.type === "string") {
        defaultFrontMatter[key] = ""
      } else if (field.type === "boolean") {
        defaultFrontMatter[key] = false
      } else if (field.type === "number") {
        defaultFrontMatter[key] = 0
      } else if (field.type === "array-string") {
        defaultFrontMatter[key] = []
      }
    }

    return { ...defaultFrontMatter, ...rawFrontMatter }
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

        case "array-string":
        case "array": {
          if (Array.isArray(value)) return value
          if (typeof value === "string") {
            // カンマ区切り文字列を配列に変換
            return value.split(",").map((item) => item.trim())
          }
          return defaultValue
        }

        case "array-number": {
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

        case "array-boolean": {
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

        case "array-relation": {
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
            fieldDef.type === "array-string" ||
            fieldDef.type === "array-number" ||
            fieldDef.type === "array-boolean" ||
            fieldDef.type === "array-relation"
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
        relationPath?: string
      }

      if (
        (fieldDef.type === "relation" || fieldDef.type === "array-relation") &&
        fieldDef.relationPath &&
        !uniqueRelationPaths.has(fieldDef.relationPath)
      ) {
        uniqueRelationPaths.add(fieldDef.relationPath)

        // リレーションパスが存在するかチェック
        if (await this.exists(fieldDef.relationPath)) {
          const relationFiles = await this.readDirectoryFiles(
            fieldDef.relationPath,
          )

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
            path: fieldDef.relationPath,
            files: relationOptions,
          })
        }
      }
    }

    return relations
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
        const docDirectory = await this.getDirectory(entryPath)
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
   * ディレクトリ情報を API レスポンス用に完全取得
   */
  async getDirectoryDataForApi(directoryPath: string) {
    const docDirectory = await this.getDirectory(directoryPath)
    const rawData = docDirectory.toJSON()

    // ディレクトリのindex.mdからdescriptionを取得
    let directoryDescription: string | null = null
    const indexPath = `${directoryPath}/index.md`
    if (await this.exists(indexPath)) {
      const indexContent = await this.readFileContent(indexPath)
      const openMarkdown = new OpenMarkdown(indexContent)
      directoryDescription = openMarkdown.description
    }

    // ディレクトリ名を抽出
    const directoryName =
      directoryPath.split("/").filter(Boolean).pop() || "Root"

    // ファイル一覧を取得
    const files = await this.getDirectoryFilesForApi(directoryPath)

    // スキーマを変換
    const schema = docDirectory.convertSchemaForApi()

    // カラムを生成
    const columns = schema
      ? Object.entries(schema).map(([key, field]) => ({
          key,
          label: field.description || key,
          type: field.type,
          relationPath: field.relationPath,
        }))
      : []

    // リレーション情報を収集
    const relations = await this.getRelationsFromSchema(rawData.schema)

    return {
      rawData,
      directoryDescription,
      directoryName,
      files,
      schema,
      columns,
      relations,
    }
  }

  /**
   * ディレクトリのファイル一覧を API レスポンス用に整形して取得
   */
  async getDirectoryFilesForApi(directoryPath: string) {
    const markdownContents = await this.readMarkdownContents(directoryPath)

    return markdownContents
      .filter(
        (file) =>
          !file.filePath.endsWith("README.md") &&
          !file.filePath.endsWith("index.md"),
      )
      .map((file) => {
        // スキーマなどの特殊なプロパティを除外してfront matterをクリーンアップ
        const cleanFrontMatter = file.frontMatter || {}
        const { schema, ...validFrontMatter } = cleanFrontMatter as Record<
          string,
          unknown
        > & { schema?: unknown }

        // ファイル名を生成（拡張子なし）
        const fileName =
          file.filePath.split("/").pop()?.replace(/\.md$/, "") || ""

        return {
          path: `docs/${file.filePath}`,
          fileName,
          frontMatter: validFrontMatter,
          content: file.content,
          title: file.title || null,
          description: new OpenMarkdown(file.content).description,
        }
      })
  }
}
