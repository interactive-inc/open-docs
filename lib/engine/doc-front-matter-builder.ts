import { frontMatterSchema } from "@/lib/models"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"

/**
 * 一般的なMarkdownファイルのFrontMatterを管理するクラス
 */
export class DocFrontMatterBuilder {
  readonly data: Record<string, unknown>

  constructor(data: Record<string, unknown>) {
    this.data = data
  }

  /**
   * Markdownテキストから生成
   */
  static from(markdownText: string): DocFrontMatterBuilder {
    const openMarkdown = new OpenMarkdown(markdownText)
    const rawData = openMarkdown.frontMatter.data || {}

    // frontMatterSchemaでバリデーション
    const validatedData = frontMatterSchema.safeParse(rawData)
    const data = validatedData.success ? validatedData.data : rawData

    return new DocFrontMatterBuilder(data)
  }

  /**
   * 空のFrontMatterを生成
   */
  static empty(): DocFrontMatterBuilder {
    return new DocFrontMatterBuilder({})
  }

  /**
   * データから直接生成
   */
  static fromData(data: Record<string, unknown>): DocFrontMatterBuilder {
    const validatedData = frontMatterSchema.safeParse(data)
    return new DocFrontMatterBuilder(
      validatedData.success ? validatedData.data : data,
    )
  }

  /**
   * スキーマフィールドに基づいてデフォルト値を生成する
   */
  static generateDefaultValueFromSchemaField(fieldDef: {
    type: string
    default?: unknown
  }): unknown {
    if (fieldDef.type === "string") {
      return fieldDef.default ?? ""
    }
    if (fieldDef.type === "boolean") {
      return fieldDef.default ?? false
    }
    if (fieldDef.type === "number") {
      return fieldDef.default ?? 0
    }
    if (
      fieldDef.type === "multi-string" ||
      fieldDef.type === "multi-number" ||
      fieldDef.type === "multi-boolean" ||
      fieldDef.type === "multi-relation"
    ) {
      return fieldDef.default ?? []
    }
    if (fieldDef.type === "relation") {
      return fieldDef.default ?? null
    }
    return null
  }
}
