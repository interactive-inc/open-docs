import { DocSchemaFieldValue } from "@/lib/engine/values/doc-schema-field-value"
import { zDocFileIndexFrontMatter } from "@/lib/models"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import type { DocFileIndexFrontMatter, DocSchemaRecord } from "@/lib/types"

/**
 * FrontMatter
 */
export class DocFrontMatterIndexValue {
  constructor(readonly value: DocFileIndexFrontMatter) {
    zDocFileIndexFrontMatter.parse(value)
    Object.freeze(this)
  }

  /**
   * アイコンを取得
   */
  get icon(): string | null {
    return this.value.icon
  }

  /**
   * スキーマを取得
   */
  get schema(): DocSchemaRecord {
    return this.value.schema || {}
  }

  /**
   * Markdownテキストから生成
   */
  static from(markdownText: string): DocFrontMatterIndexValue {
    const openMarkdown = new OpenMarkdown(markdownText)

    if (openMarkdown.frontMatter === null) {
      throw new Error("FrontMatter is null")
    }

    const rawData = openMarkdown.frontMatter.data || {}

    // デフォルト値を事前に設定
    const dataWithDefaults = {
      icon: rawData.icon ?? null,
      schema: rawData.schema ?? null,
    }

    // スキーマフィールドを正規化（存在しないフィールドをnullに設定）
    if (
      dataWithDefaults.schema &&
      typeof dataWithDefaults.schema === "object"
    ) {
      dataWithDefaults.schema = DocFrontMatterIndexValue.normalizeSchema(
        dataWithDefaults.schema as Record<string, unknown>,
      )
    }

    // indexFrontMatterSchemaでバリデーション
    try {
      const result = zDocFileIndexFrontMatter.parse(dataWithDefaults)
      return new DocFrontMatterIndexValue({
        icon: result.icon,
        schema: result.schema || {},
      })
    } catch {
      return DocFrontMatterIndexValue.empty()
    }
  }

  /**
   * 空のFrontMatterを生成
   */
  static empty(): DocFrontMatterIndexValue {
    return new DocFrontMatterIndexValue({
      icon: "",
      schema: {},
    })
  }

  /**
   * データから直接生成
   */
  static fromData(data: unknown): DocFrontMatterIndexValue {
    // デフォルト値を事前に設定
    const dataObj =
      data && typeof data === "object" ? (data as Record<string, unknown>) : {}
    const dataWithDefaults = {
      icon: dataObj.icon ?? null,
      schema: dataObj.schema ?? null,
    }

    // スキーマフィールドを正規化（存在しないフィールドをnullに設定）
    if (
      dataWithDefaults.schema &&
      typeof dataWithDefaults.schema === "object"
    ) {
      dataWithDefaults.schema = DocFrontMatterIndexValue.normalizeSchema(
        dataWithDefaults.schema as Record<string, unknown>,
      )
    }

    try {
      const validatedData = zDocFileIndexFrontMatter.parse(dataWithDefaults)
      return new DocFrontMatterIndexValue({
        icon: validatedData.icon,
        schema: validatedData.schema || {},
      })
    } catch {
      return DocFrontMatterIndexValue.empty()
    }
  }

  /**
   * スキーマ全体を正規化
   */
  private static normalizeSchema(
    schema: Record<string, unknown>,
  ): Record<string, unknown> {
    const normalized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(schema)) {
      // DocSchemaFieldValueの正規化機能を使用
      const fieldValue = DocSchemaFieldValue.fromUnknown(key, value)
      normalized[key] = fieldValue.toJson()
    }

    return normalized
  }

  /**
   * JSON形式で出力
   */
  toJson(): DocFileIndexFrontMatter {
    return this.value
  }
}
