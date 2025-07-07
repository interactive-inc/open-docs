import { stringify } from "yaml"
import { zDocFileMdFrontMatter } from "../models"
import type {
  DocFieldMultiBoolean,
  DocFieldMultiNumber,
  DocFieldMultiText,
  DocFileMdFrontMatter,
  DocSchemaFieldBoolean,
  DocSchemaFieldNumber,
  DocSchemaFieldText,
} from "../types"
import { DocContentMdValue } from "./doc-content-md-value"
import { DocSchemaFieldBooleanMultipleValue } from "./doc-schema-field-boolean-multiple-value"
import { DocSchemaFieldBooleanSingleValue } from "./doc-schema-field-boolean-single-value"
import { DocSchemaFieldFactory } from "./doc-schema-field-factory"
import { DocSchemaFieldNumberMultipleValue } from "./doc-schema-field-number-multiple-value"
import { DocSchemaFieldNumberSingleValue } from "./doc-schema-field-number-single-value"
import { DocSchemaFieldTextMultipleValue } from "./doc-schema-field-text-multiple-value"
import { DocSchemaFieldTextSingleValue } from "./doc-schema-field-text-single-value"
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

  /**
   * テキスト型のプロパティを取得
   */
  text(key: string): string | null {
    const value = this.value[key]
    const validator = new DocSchemaFieldTextSingleValue(key, {
      type: "text",
      required: false,
      title: null,
      description: null,
      default: null,
    } satisfies DocSchemaFieldText)
    return validator.validate(value) && typeof value === "string" ? value : null
  }

  /**
   * 数値型のプロパティを取得
   */
  number(key: string): number | null {
    const value = this.value[key]
    const validator = new DocSchemaFieldNumberSingleValue(key, {
      type: "number",
      required: false,
      title: null,
      description: null,
      default: null,
    } satisfies DocSchemaFieldNumber)
    return validator.validate(value) && typeof value === "number" ? value : null
  }

  /**
   * 真偽値型のプロパティを取得
   */
  boolean(key: string): boolean | null {
    const value = this.value[key]
    const validator = new DocSchemaFieldBooleanSingleValue(key, {
      type: "boolean",
      required: false,
      title: null,
      description: null,
      default: null,
    } satisfies DocSchemaFieldBoolean)
    return validator.validate(value) && typeof value === "boolean"
      ? value
      : null
  }

  /**
   * 単一リレーション型のプロパティを取得
   */
  relation(key: string): string | null {
    const value = this.value[key]
    // リレーションもテキスト型と同じバリデーション
    const validator = new DocSchemaFieldTextSingleValue(key, {
      type: "text",
      required: false,
      title: null,
      description: null,
      default: null,
    } satisfies DocSchemaFieldText)
    return validator.validate(value) && typeof value === "string" ? value : null
  }

  /**
   * 複数リレーション型のプロパティを取得
   */
  multiRelation(key: string): string[] {
    const value = this.value[key]
    const validator = new DocSchemaFieldTextMultipleValue(key, {
      type: "multi-text",
      required: false,
      title: null,
      description: null,
      default: null,
    } satisfies DocFieldMultiText)
    return validator.validate(value) && Array.isArray(value)
      ? (value as string[])
      : []
  }

  /**
   * 複数テキスト型のプロパティを取得
   */
  multiText(key: string): string[] {
    const value = this.value[key]
    const validator = new DocSchemaFieldTextMultipleValue(key, {
      type: "multi-text",
      required: false,
      title: null,
      description: null,
      default: null,
    } satisfies DocFieldMultiText)
    return validator.validate(value) && Array.isArray(value)
      ? (value as string[])
      : []
  }

  /**
   * 複数数値型のプロパティを取得
   */
  multiNumber(key: string): number[] {
    const value = this.value[key]
    const validator = new DocSchemaFieldNumberMultipleValue(key, {
      type: "multi-number",
      required: false,
      title: null,
      description: null,
      default: null,
    } satisfies DocFieldMultiNumber)
    return validator.validate(value) && Array.isArray(value)
      ? (value as number[])
      : []
  }

  /**
   * 複数真偽値型のプロパティを取得
   */
  multiBoolean(key: string): boolean[] {
    const value = this.value[key]
    const validator = new DocSchemaFieldBooleanMultipleValue(key, {
      type: "multi-boolean",
      required: false,
      title: null,
      description: null,
      default: null,
    } satisfies DocFieldMultiBoolean)
    return validator.validate(value) && Array.isArray(value)
      ? (value as boolean[])
      : []
  }

  /**
   * プロパティが存在するかチェック
   */
  has(key: string): boolean {
    return key in this.value && this.value[key] !== undefined
  }

  /**
   * すべてのキーを取得
   */
  get keys(): string[] {
    return Object.keys(this.value)
  }
}
