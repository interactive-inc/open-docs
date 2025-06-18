import { zDocFileMdFrontMatter } from "@/lib/models"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import type { DocFileMdFrontMatter } from "@/lib/types"

/**
 * FrontMatter
 */
export class DocFrontMatterMdValue {
  constructor(readonly value: DocFileMdFrontMatter) {
    zDocFileMdFrontMatter.parse(value)
    Object.freeze(this)
  }

  /**
   * Markdownテキストから生成
   */
  static from(markdownText: string): DocFrontMatterMdValue {
    const openMarkdown = new OpenMarkdown(markdownText)

    const rawData = openMarkdown.frontMatter.data || {}

    const data = zDocFileMdFrontMatter.parse(rawData)

    return new DocFrontMatterMdValue(data)
  }

  /**
   * 空のFrontMatterを生成
   */
  static empty(): DocFrontMatterMdValue {
    return new DocFrontMatterMdValue({})
  }

  /**
   * データから直接生成
   */
  static fromData(data: unknown): DocFrontMatterMdValue {
    const validatedData = zDocFileMdFrontMatter.parse(data)
    return new DocFrontMatterMdValue(validatedData)
  }

  /**
   * スキーマフィールドに基づいてデフォルト値を生成する
   */
  static generateDefaultValueFromSchemaField(fieldDef: {
    type: string
    default?: unknown
  }): unknown {
    if (fieldDef.type === "text") {
      return fieldDef.default ?? ""
    }
    if (fieldDef.type === "boolean") {
      return fieldDef.default ?? false
    }
    if (fieldDef.type === "number") {
      return fieldDef.default ?? 0
    }
    if (
      fieldDef.type === "multi-text" ||
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

  /**
   * JSON形式に変換
   */
  toJson(): DocFileMdFrontMatter {
    return this.value
  }
}
