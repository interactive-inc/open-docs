import { parse, stringify } from "yaml"
import { zDocFileIndexFrontMatter } from "../models"
import type {
  DocFileIndexFrontMatter,
  DocSchemaField,
  DocSchemaRecord,
} from "../types"
import { DocSchemaValue } from "../values/doc-schema-value"
import { DocSchemaFieldFactory } from "./doc-schema-field-factory"

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
  get schema(): DocSchemaValue {
    return new DocSchemaValue(this.value.schema)
  }

  /**
   * iconフィールドを更新
   */
  withIcon(value: unknown): DocFrontMatterIndexValue {
    if (typeof value !== "string") {
      return this
    }

    const currentData = this.toJson()

    return DocFrontMatterIndexValue.fromRecord({
      ...currentData,
      icon: value,
    })
  }

  /**
   * schemaフィールドを更新
   */
  withSchema(value: unknown): DocFrontMatterIndexValue {
    if (typeof value !== "object" || value === null) {
      return this
    }

    const currentData = this.toJson()

    return DocFrontMatterIndexValue.fromRecord({
      ...currentData,
      schema: DocFrontMatterIndexValue.createSchema(value),
    })
  }

  /**
   * JSON形式で出力
   */
  toJson(): DocFileIndexFrontMatter {
    return this.value
  }

  /**
   * YAML形式で出力
   */
  toYaml(): string {
    // iconとschemaのみを明示的に出力
    const yamlData = {
      icon: this.value.icon,
      schema: this.value.schema,
    }
    return stringify(yamlData).trim()
  }

  /**
   * スキーマ全体を正規化
   */
  private static createSchema(schema: unknown): DocSchemaRecord {
    if (typeof schema !== "object" || schema === null) {
      return {}
    }

    const schemaObj = schema
    const record: DocSchemaRecord = {}

    for (const [key, value] of Object.entries(schemaObj)) {
      const normalizedField = DocFrontMatterIndexValue.createSchemaField(
        key,
        value,
      )
      if (normalizedField === null) continue
      record[key] = normalizedField
    }

    return record
  }

  /**
   * スキーマフィールドを正規化
   */
  private static createSchemaField(
    key: string,
    value: unknown,
  ): DocSchemaField | null {
    try {
      const factory = new DocSchemaFieldFactory()
      const fieldValue = factory.fromUnknown(key, value)
      return fieldValue.toJson()
    } catch {
      return null
    }
  }

  /**
   * Markdownテキストから生成（不完全なデータも処理可能）
   */
  static from(markdownText: string): DocFrontMatterIndexValue {
    // FrontMatterセクションを抽出
    if (!markdownText.startsWith("---")) {
      return DocFrontMatterIndexValue.empty()
    }

    const endIndex = markdownText.indexOf("\n---", 3)
    if (endIndex === -1) {
      return DocFrontMatterIndexValue.empty()
    }

    const frontMatterText = markdownText.slice(4, endIndex).trim()

    try {
      // YAMLをパース
      const data = parse(frontMatterText) || {}
      return DocFrontMatterIndexValue.fromRecord(data)
    } catch {
      return DocFrontMatterIndexValue.empty()
    }
  }

  /**
   * データから直接生成（不完全なデータも処理可能）
   */
  static fromRecord(record: Record<string, unknown>): DocFrontMatterIndexValue {
    if (typeof record !== "object") {
      return DocFrontMatterIndexValue.empty()
    }

    const icon = DocFrontMatterIndexValue.extractIcon(record)

    const schema = DocFrontMatterIndexValue.extractSchema(record)

    const frontMatter: DocFileIndexFrontMatter = {
      type: "index-frontmatter",
      icon,
      schema,
    }

    try {
      const validated = zDocFileIndexFrontMatter.parse(frontMatter)
      return new DocFrontMatterIndexValue(validated)
    } catch {
      return DocFrontMatterIndexValue.empty()
    }
  }

  /**
   * 空のFrontMatterを生成
   */
  static empty(): DocFrontMatterIndexValue {
    return new DocFrontMatterIndexValue({
      type: "index-frontmatter",
      icon: "",
      schema: {},
    })
  }

  /**
   * アイコンを抽出
   */
  private static extractIcon(data: Record<string, unknown>): string {
    if ("icon" in data && typeof data.icon === "string") {
      return data.icon
    }

    return DocFrontMatterIndexValue.getDefaultIcon()
  }

  /**
   * スキーマを抽出
   */
  private static extractSchema(data: Record<string, unknown>): DocSchemaRecord {
    const hasSchema = "schema" in data

    if (!hasSchema) {
      return {}
    }

    if (typeof data.schema !== "object") {
      return {}
    }

    if (data.schema === null) {
      return {}
    }

    return DocFrontMatterIndexValue.createSchema(data.schema)
  }

  /**
   * デフォルトのアイコンを取得
   */
  private static getDefaultIcon(): string {
    return "📃"
  }
}
