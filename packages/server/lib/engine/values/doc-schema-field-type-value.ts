import { zDocSchemaFieldType } from "@/lib/models"
import type { DocSchemaFieldType } from "@/lib/types"

/**
 * スキーマフィールドタイプ
 */
export class DocSchemaFieldTypeValue {
  constructor(private readonly value: DocSchemaFieldType) {
    zDocSchemaFieldType.parse(value)
    Object.freeze(this)
  }

  /**
   * タイプ値を取得
   */
  get type() {
    return this.value
  }

  /**
   * テキスト型かどうか
   */
  get isText() {
    return this.value === "text"
  }

  /**
   * 数値型かどうか
   */
  get isNumber() {
    return this.value === "number"
  }

  /**
   * ブール型かどうか
   */
  get isBoolean() {
    return this.value === "boolean"
  }

  /**
   * 選択型（単一）かどうか
   */
  get isSelect() {
    return this.value === "select-text" || this.value === "select-number"
  }

  /**
   * リレーション型かどうか
   */
  get isRelation() {
    return this.value === "relation" || this.value === "multi-relation"
  }

  /**
   * 配列型かどうか
   */
  get isArray() {
    return (
      this.value === "multi-text" ||
      this.value === "multi-number" ||
      this.value === "multi-boolean" ||
      this.value === "multi-relation" ||
      this.value === "multi-select-text" ||
      this.value === "multi-select-number"
    )
  }

  /**
   * 単一値型かどうか
   */
  get isSingle() {
    return !this.isArray
  }

  /**
   * 基本型を取得（multi-textの場合はtext）
   */
  get baseType(): string {
    if (this.value.startsWith("multi-")) {
      return this.value.replace("multi-", "")
    }
    if (this.value.startsWith("select-")) {
      return this.value.replace("select-", "")
    }
    return this.value
  }

  /**
   * デフォルト値を取得
   */
  getDefaultValue(): unknown {
    if (this.isArray) return []
    if (this.isText) return ""
    if (this.isNumber) return 0
    if (this.isBoolean) return false
    if (this.isRelation) return ""
    return ""
  }

  /**
   * 値の検証
   */
  validateValue(value: unknown): boolean {
    if (this.isArray) {
      if (!Array.isArray(value)) return false
      const baseType = this.baseType
      return value.every((item) => {
        if (baseType === "text") return typeof item === "string"
        if (baseType === "number") return typeof item === "number"
        if (baseType === "boolean") return typeof item === "boolean"
        return true
      })
    }

    if (this.isText) return typeof value === "string"
    if (this.isNumber) return typeof value === "number"
    if (this.isBoolean) return typeof value === "boolean"
    if (this.isRelation) return typeof value === "string"

    return true
  }

  /**
   * 文字列から生成
   */
  static from(type: string): DocSchemaFieldTypeValue {
    return new DocSchemaFieldTypeValue(type as DocSchemaFieldType)
  }

  /**
   * JSON形式に変換
   */
  toJson(): DocSchemaFieldType {
    return this.value
  }
}
