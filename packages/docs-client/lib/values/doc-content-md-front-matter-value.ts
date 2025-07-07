import { parse, stringify } from "yaml"

/**
 * フロントマターの処理を担当
 */
export class DocContentMdFrontMatterValue {
  public readonly data: Record<string, unknown> | null

  public readonly yamlText: string

  constructor(data: Record<string, unknown> | null, yamlText = "") {
    this.data = data
    this.yamlText = yamlText
  }

  /**
   * YAMLテキストからフロントマターインスタンスを作成
   */
  public static fromYamlText(yamlText: string): DocContentMdFrontMatterValue {
    if (!yamlText || typeof yamlText !== "string" || !yamlText.trim()) {
      return new DocContentMdFrontMatterValue({}, "")
    }
    const parsed = parse(yamlText) || {}
    return new DocContentMdFrontMatterValue(parsed, yamlText)
  }

  /**
   * Markdownテキストからフロントマターインスタンスを作成
   */
  public static fromMarkdown(
    markdownText: string,
  ): DocContentMdFrontMatterValue {
    if (!markdownText || !markdownText.startsWith("---")) {
      return DocContentMdFrontMatterValue.empty()
    }

    const startIndex = markdownText.indexOf("---")
    const endIndex = markdownText.indexOf("---", startIndex + 3)

    if (endIndex === -1) {
      return DocContentMdFrontMatterValue.empty()
    }

    const yamlText = markdownText.slice(startIndex + 3, endIndex).trim()

    return DocContentMdFrontMatterValue.fromYamlText(yamlText)
  }

  /**
   * 空のフロントマターインスタンスを作成
   */
  public static empty(): DocContentMdFrontMatterValue {
    return new DocContentMdFrontMatterValue(null, "")
  }

  /**
   * フロントマターデータからインスタンスを作成
   */
  public static fromFrontMatter(
    data: Record<string, unknown>,
  ): DocContentMdFrontMatterValue {
    const instance = new DocContentMdFrontMatterValue(data, "")
    // YAMLテキストを生成して保存
    const yamlText = instance.frontMatterText()
    return new DocContentMdFrontMatterValue(data, yamlText)
  }

  /**
   * フロントマターをYAMLテキストに変換
   */
  public frontMatterText(): string {
    if (this.data === null || Object.keys(this.data).length === 0) return ""

    return stringify(this.data).trim()
  }

  /**
   * フロントマターを更新した新しいインスタンスを作成
   */
  public update(draft: Record<string, unknown>): DocContentMdFrontMatterValue {
    const updatedData = { ...(this.data || {}) }

    for (const [key, value] of Object.entries(draft)) {
      updatedData[key] = value
    }

    return DocContentMdFrontMatterValue.fromFrontMatter(updatedData)
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
    return this.data !== null && key in this.data
  }

  /**
   * フロントマターのキー一覧を取得
   */
  public keys(): string[] {
    return this.data ? Object.keys(this.data) : []
  }
}
