import { zDocFileMdFrontMatter, zDocRelationFile, zDocSchema } from "../models"
import type {
  DocFileMdFrontMatter,
  DocRelationFile,
  DocSchemaField,
  DocSchemaRecord,
  RelationFieldTypes,
} from "../types"
import { DocFrontMatterMdValue } from "./doc-front-matter-md-value"
import { DocSchemaFieldFactory } from "./doc-schema-field-factory"
import { DocSchemaFieldRelationMultipleValue } from "./doc-schema-field-relation-multiple-value"
import { DocSchemaFieldRelationSingleValue } from "./doc-schema-field-relation-single-value"
import type { DocSchemaFieldValue } from "./doc-schema-field-value"

/**
 * スキーマとリレーション
 */
export class DocSchemaValue {
  constructor(readonly value: DocSchemaRecord) {
    zDocSchema.parse(value)
    Object.freeze(this.value)
    Object.freeze(this)
  }

  /**
   * フィールド名の一覧を取得
   */
  get fieldNames(): string[] {
    return Object.keys(this.value)
  }

  /**
   * 指定されたフィールド名のフィールドを取得
   */
  field(name: string): DocSchemaFieldValue | null {
    const fieldDef = this.value[name]

    if (fieldDef === undefined) {
      return null
    }

    const factory = new DocSchemaFieldFactory()

    return factory.fromSchemaEntry(name, fieldDef)
  }

  get fields() {
    const factory = new DocSchemaFieldFactory()

    return this.fieldNames.map((name) => {
      const fieldValue = this.value[name]
      if (!fieldValue) {
        throw new Error(`Field ${name} not found in schema`)
      }
      return factory.fromSchemaEntry(name, fieldValue)
    })
  }

  get relationFields(): (
    | DocSchemaFieldRelationSingleValue
    | DocSchemaFieldRelationMultipleValue
  )[] {
    return this.fields.filter((t) => {
      return (
        t instanceof DocSchemaFieldRelationSingleValue ||
        t instanceof DocSchemaFieldRelationMultipleValue
      )
    })
  }

  /**
   * 空のスキーマエンティティを作成
   */
  static empty(): DocSchemaValue {
    return new DocSchemaValue({})
  }

  /**
   * スキーマからリレーションパスを抽出
   */
  extractRelationPaths(): Set<string> {
    if (!this.value) return new Set<string>()

    const uniqueRelationPaths = new Set<string>()

    for (const field of Object.values(this.value)) {
      if (this.isRelationField(field) && "path" in field) {
        uniqueRelationPaths.add(field.path)
      }
    }

    return uniqueRelationPaths
  }

  /**
   * フィールドがリレーション型かどうかを判定
   */
  private isRelationField(field: DocSchemaField): field is RelationFieldTypes {
    return field.type === "relation" || field.type === "multi-relation"
  }

  /**
   * リレーションオプションを作成
   */
  createRelationOption(
    filePath: string,
    title: string | null,
  ): DocRelationFile {
    const fileName = this.extractFileName(filePath)
    return zDocRelationFile.parse({
      name: fileName,
      label: title || fileName,
      value: fileName,
      path: filePath,
    })
  }

  /**
   * ファイルをスキップすべきかどうかを判定
   */
  shouldSkipFile(filePath: string): boolean {
    return filePath.endsWith("index.md") || filePath.endsWith("README.md")
  }

  /**
   * 値を指定された型に変換する（デフォルト値フォールバック付き）
   */
  convertValue(
    value: unknown,
    targetType: string,
    defaultValue: unknown,
  ): unknown {
    if (this.isNullOrUndefined(value)) {
      return defaultValue
    }

    try {
      return this.convertByType(value, targetType, defaultValue)
    } catch {
      return defaultValue
    }
  }

  /**
   * 型別の変換処理
   */
  private convertByType(
    value: unknown,
    targetType: string,
    defaultValue: unknown,
  ): unknown {
    if (targetType === "text") {
      return this.convertToString(value, defaultValue)
    }
    if (targetType === "number") {
      return this.convertToNumber(value, defaultValue)
    }
    if (targetType === "boolean") {
      return this.convertToBoolean(value, defaultValue)
    }
    if (targetType === "multi-text" || targetType === "array") {
      return this.convertToArray(value, defaultValue)
    }
    if (targetType === "relation") {
      return this.convertToRelation(value, defaultValue)
    }
    if (targetType === "multi-relation") {
      return this.convertToMultiRelation(value, defaultValue)
    }
    return defaultValue
  }

  /**
   * 文字列型への変換
   */
  private convertToString(value: unknown, defaultValue: unknown): unknown {
    if (typeof value === "string") return value
    if (typeof value === "number") return String(value)
    if (typeof value === "boolean") return String(value)
    return defaultValue
  }

  /**
   * 数値型への変換
   */
  private convertToNumber(value: unknown, defaultValue: unknown): unknown {
    if (typeof value === "number") return value
    if (typeof value === "string") {
      const parsed = Number(value)
      return Number.isNaN(parsed) ? defaultValue : parsed
    }
    if (typeof value === "boolean") return value ? 1 : 0
    return defaultValue
  }

  /**
   * ブール型への変換
   */
  private convertToBoolean(value: unknown, defaultValue: unknown): unknown {
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

  /**
   * 配列型への変換
   */
  private convertToArray(value: unknown, defaultValue: unknown): unknown {
    if (Array.isArray(value)) return value
    if (typeof value === "string") {
      return value.split(",").map((item) => item.trim())
    }
    return defaultValue
  }

  /**
   * リレーション型への変換
   */
  private convertToRelation(value: unknown, defaultValue: unknown): unknown {
    if (typeof value === "string") {
      return this.extractFileNameFromPath(value)
    }
    return defaultValue
  }

  /**
   * マルチリレーション型への変換
   */
  private convertToMultiRelation(
    value: unknown,
    defaultValue: unknown,
  ): unknown {
    if (Array.isArray(value)) {
      return value
        .filter((item) => typeof item === "string")
        .map((item) => this.extractFileNameFromPath(item))
    }
    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => this.extractFileNameFromPath(item.trim()))
    }
    return defaultValue
  }

  /**
   * パスからファイル名を抽出（拡張子除去）
   */
  private extractFileNameFromPath(path: string): string {
    const fileName = path.split("/").pop() || path
    return fileName.replace(/\.md$/, "")
  }

  /**
   * スキーマベースでFrontMatterを補完する
   */
  getCompleteFrontMatter(rawFrontMatter: unknown): DocFileMdFrontMatter {
    const defaultFrontMatter = this.generateDefaultFrontMatter()
    return this.mergePreservingExistingValues(
      defaultFrontMatter,
      rawFrontMatter,
    )
  }

  /**
   * スキーマからデフォルトFrontMatterを生成
   */
  private generateDefaultFrontMatter(): DocFileMdFrontMatter {
    if (!this.value) return {}

    const defaultFrontMatter: Record<string, unknown> = {}

    for (const [key, field] of Object.entries(this.value)) {
      defaultFrontMatter[key] =
        DocFrontMatterMdValue.generateDefaultValueFromSchemaField(field)
    }

    return zDocFileMdFrontMatter.parse(defaultFrontMatter)
  }

  /**
   * 既存の値を保持しながらマージ
   */
  private mergePreservingExistingValues(
    defaults: DocFileMdFrontMatter,
    existing: unknown,
  ): DocFileMdFrontMatter {
    const result = { ...defaults }

    if (existing && typeof existing === "object") {
      const validatedData = zDocFileMdFrontMatter.parse(existing)
      for (const [key, value] of Object.entries(validatedData)) {
        if (value !== undefined && value !== null) {
          result[key] = value
        }
      }
    }

    return result
  }

  /**
   * ファイルパスからファイル名を抽出（拡張子なし）
   */
  private extractFileName(filePath: string): string {
    return filePath.split("/").pop()?.replace(".md", "") || filePath
  }

  /**
   * nullまundefinedのチェック
   */
  private isNullOrUndefined(value: unknown): boolean {
    return value === null || value === undefined
  }

  toJson(): DocSchemaRecord {
    return this.value
  }
}
