import { stringify } from "yaml"
import { zDocFileMdFrontMatter } from "../models"
import type { DocFileMdFrontMatter } from "../types"
import { DocContentMdValue } from "./doc-content-md-value"
import { DocSchemaFieldFactory } from "./doc-schema-field-factory"
import type { DocSchemaFieldValue } from "./doc-schema-field-value"
import type { DocSchemaValue } from "./doc-schema-value"

/**
 * FrontMatter
 */
export class DocFrontMatterMdValue {
  constructor(readonly value: DocFileMdFrontMatter) {
    zDocFileMdFrontMatter.parse(value)
    Object.freeze(this)
  }

  toJson(): DocFileMdFrontMatter {
    return this.value
  }

  toYaml(): string {
    return stringify(this.value).trim()
  }

  /**
   * Markdownテキストから生成
   */
  static from(markdownText: string): DocFrontMatterMdValue {
    const openMarkdown = new DocContentMdValue(markdownText)

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
   * 単一のプロパティを更新した新しいインスタンスを返す
   * スキーマに基づいて型を検証し、スキーマのフィールドのみを含む新しいインスタンスを生成
   */
  withProperty(
    key: string,
    value: unknown,
    schema: DocSchemaValue,
  ): DocFrontMatterMdValue {
    const currentData = this.toJson()

    const fieldValue = schema.field(key)

    if (fieldValue === null) {
      return this
    }

    if (!this.validateFieldValue(key, value, fieldValue)) {
      return this
    }

    // スキーマを元にFrontMatterを再構築
    const draft: DocFileMdFrontMatter = {}

    for (const field of schema.fields) {
      const fieldKey = field.key

      if (fieldKey === key) {
        // 更新対象のフィールドは新しい値を使用
        // valueは事前にvalidateFieldValueで検証済み
        draft[fieldKey] = value as
          | string
          | number
          | boolean
          | Record<string, unknown>
          | string[]
          | number[]
          | boolean[]
          | null
      } else if (fieldKey in currentData) {
        // 既存の値があればそれを使用
        const value = currentData[fieldKey]
        if (value !== undefined) {
          draft[fieldKey] = value
        }
      } else {
        // 値がない場合はデフォルト値を使用
        draft[fieldKey] = field.toJson().default
      }
    }

    return new DocFrontMatterMdValue(draft)
  }

  /**
   * フィールド値の検証
   */
  private validateFieldValue(
    key: string,
    value: unknown,
    fieldDef: DocSchemaFieldValue,
  ): boolean {
    try {
      const factory = new DocSchemaFieldFactory()
      const schemaField = factory.fromSchemaEntry(key, fieldDef)
      return schemaField.validate(value)
    } catch {
      return false
    }
  }
}
