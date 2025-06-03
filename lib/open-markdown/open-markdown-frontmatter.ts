import { parse, stringify } from "yaml"

/**
 * フロントマターの処理を担当するクラス
 */
export class OpenMarkdownFrontmatter {
  public readonly data: Record<string, unknown> | null
  public readonly yamlText: string

  constructor(data: Record<string, unknown> | null, yamlText = "") {
    this.data = data
    this.yamlText = yamlText
  }

  /**
   * YAMLテキストからフロントマターインスタンスを作成
   */
  public static fromYamlText(yamlText: string): OpenMarkdownFrontmatter {
    if (!yamlText || typeof yamlText !== "string" || !yamlText.trim()) {
      return new OpenMarkdownFrontmatter({}, "")
    }
    const parsed = parse(yamlText) || {}
    return new OpenMarkdownFrontmatter(parsed, yamlText)
  }

  /**
   * Markdownテキストからフロントマターインスタンスを作成
   */
  public static fromMarkdown(markdownText: string): OpenMarkdownFrontmatter {
    if (!markdownText || !markdownText.startsWith("---")) {
      return OpenMarkdownFrontmatter.empty()
    }

    const startIndex = markdownText.indexOf("---")
    const endIndex = markdownText.indexOf("---", startIndex + 3)

    if (endIndex === -1) {
      return OpenMarkdownFrontmatter.empty()
    }

    const yamlText = markdownText.slice(startIndex + 3, endIndex).trim()

    return OpenMarkdownFrontmatter.fromYamlText(yamlText)
  }

  /**
   * 空のフロントマターインスタンスを作成
   */
  public static empty(): OpenMarkdownFrontmatter {
    return new OpenMarkdownFrontmatter(null, "")
  }

  /**
   * フロントマターデータからインスタンスを作成
   */
  public static fromFrontMatter(
    data: Record<string, unknown>,
  ): OpenMarkdownFrontmatter {
    const instance = new OpenMarkdownFrontmatter(data, "")
    // YAMLテキストを生成して保存
    const yamlText = instance.frontMatterText()
    return new OpenMarkdownFrontmatter(data, yamlText)
  }

  /**
   * フロントマターをYAMLテキストに変換
   */
  public frontMatterText(): string {
    if (!this.data) return ""

    const orderedKeys = ["icon", "title", "description", "schema"]
    const orderedFrontMatter: Record<string, unknown> = {}

    for (const key of orderedKeys) {
      if (key in this.data) {
        orderedFrontMatter[key] = this.data[key]
      }
    }

    for (const [key, value] of Object.entries(this.data)) {
      if (!orderedKeys.includes(key)) {
        orderedFrontMatter[key] = value
      }
    }

    return stringify(orderedFrontMatter).trim()
  }

  /**
   * フロントマターを更新した新しいインスタンスを作成
   */
  public update(draft: Record<string, unknown>): OpenMarkdownFrontmatter {
    const currentData = this.data || {}
    const updatedData = { ...currentData }

    for (const [key, value] of Object.entries(draft)) {
      updatedData[key] = value
    }

    return OpenMarkdownFrontmatter.fromFrontMatter(updatedData)
  }

  /**
   * フロントマターが空かどうか
   */
  public isEmpty(): boolean {
    return this.data === null || Object.keys(this.data).length === 0
  }

  /**
   * 指定したキーの値を取得
   */
  public get(key: string): unknown {
    return this.data?.[key]
  }

  /**
   * 指定したキーが存在するか
   */
  public has(key: string): boolean {
    return this.data ? key in this.data : false
  }

  /**
   * フロントマターのキー一覧を取得
   */
  public keys(): string[] {
    return this.data ? Object.keys(this.data) : []
  }
}
