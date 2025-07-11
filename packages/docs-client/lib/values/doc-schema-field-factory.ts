import { zDocSchemaField } from "../models"
import type { DocSchemaField } from "../types"

import { DocSchemaFieldBooleanMultipleValue } from "./doc-schema-field-boolean-multiple-value"
import { DocSchemaFieldBooleanSingleValue } from "./doc-schema-field-boolean-single-value"
import { DocSchemaFieldNumberMultipleValue } from "./doc-schema-field-number-multiple-value"
import { DocSchemaFieldNumberSingleValue } from "./doc-schema-field-number-single-value"
import { DocSchemaFieldRelationMultipleValue } from "./doc-schema-field-relation-multiple-value"
import { DocSchemaFieldRelationSingleValue } from "./doc-schema-field-relation-single-value"
import { DocSchemaFieldSelectNumberMultipleValue } from "./doc-schema-field-select-number-multiple-value"
import { DocSchemaFieldSelectNumberSingleValue } from "./doc-schema-field-select-number-single-value"
import { DocSchemaFieldSelectTextMultipleValue } from "./doc-schema-field-select-text-multiple-value"
import { DocSchemaFieldSelectTextSingleValue } from "./doc-schema-field-select-text-single-value"
import { DocSchemaFieldTextMultipleValue } from "./doc-schema-field-text-multiple-value"
import { DocSchemaFieldTextSingleValue } from "./doc-schema-field-text-single-value"
import { DocSchemaFieldTypeValue } from "./doc-schema-field-type-value"
import type { DocSchemaFieldValue } from "./doc-schema-field-value"

/**
 * スキーマフィールドファクトリ
 */
export class DocSchemaFieldFactory {
  constructor() {
    Object.freeze(this)
  }

  /**
   * スキーマエントリから適切な型のフィールドを生成
   */
  fromSchemaEntry(key: string, field: DocSchemaField): DocSchemaFieldValue {
    if (field.type === "text") {
      return new DocSchemaFieldTextSingleValue(key, field)
    }

    if (field.type === "multi-text") {
      return new DocSchemaFieldTextMultipleValue(key, field)
    }

    if (field.type === "number") {
      return new DocSchemaFieldNumberSingleValue(key, field)
    }

    if (field.type === "multi-number") {
      return new DocSchemaFieldNumberMultipleValue(key, field)
    }

    if (field.type === "boolean") {
      return new DocSchemaFieldBooleanSingleValue(key, field)
    }

    if (field.type === "multi-boolean") {
      return new DocSchemaFieldBooleanMultipleValue(key, field)
    }

    if (field.type === "select-text") {
      return new DocSchemaFieldSelectTextSingleValue(key, field)
    }

    if (field.type === "select-number") {
      return new DocSchemaFieldSelectNumberSingleValue(key, field)
    }

    if (field.type === "multi-select-text") {
      return new DocSchemaFieldSelectTextMultipleValue(key, field)
    }

    if (field.type === "multi-select-number") {
      return new DocSchemaFieldSelectNumberMultipleValue(key, field)
    }

    if (field.type === "relation") {
      return new DocSchemaFieldRelationSingleValue(key, field)
    }

    if (field.type === "multi-relation") {
      return new DocSchemaFieldRelationMultipleValue(key, field)
    }

    throw new Error("Unknown field type")
  }

  /**
   * 未検証のデータから正規化して生成
   */
  fromUnknown(key: string, data: unknown): DocSchemaFieldValue {
    const normalized = this.normalizeField(data)
    const validated = zDocSchemaField.parse(normalized)
    return this.fromSchemaEntry(key, validated)
  }

  /**
   * フィールド定義を正規化
   */
  private normalizeField(field: unknown): Record<string, unknown> {
    if (!field || typeof field !== "object") {
      // オブジェクトでない場合はデフォルトのテキストフィールドとして扱う
      return this.createDefaultTextField()
    }

    const fieldType = this.getFieldProperty(field, "type")
    const fieldRequired = this.getFieldProperty(field, "required")
    const fieldTitle = this.getFieldProperty(field, "title")
    const fieldDescription = this.getFieldProperty(field, "description")
    const fieldDefault = this.getFieldProperty(field, "default")

    // 型の正規化
    const normalizedType = this.normalizeType(fieldType)
    const typeValue = DocSchemaFieldTypeValue.from(normalizedType)

    // 正規化されたフィールドを構築
    const baseField = {
      type: normalizedType,
      required: fieldRequired ?? false,
      title: fieldTitle ?? null,
      description: fieldDescription ?? null,
      default: fieldDefault ?? null,
    }

    // 型固有のデフォルト値を追加
    return {
      ...baseField,
      ...this.getTypeSpecificDefaults(field, typeValue),
    }
  }

  /**
   * デフォルトのテキストフィールドを作成
   */
  private createDefaultTextField(): Record<string, unknown> {
    return {
      type: "text",
      required: false,
      title: null,
      description: null,
      default: null,
    }
  }

  /**
   * 型名を正規化
   */
  private normalizeType(type: unknown): string {
    if (typeof type !== "string") return "text"

    // 旧型名から新型名への変換
    if (type === "string") return "text"
    if (type === "multi-string") return "multi-text"

    return type
  }

  /**
   * オブジェクトからプロパティを安全に取得
   */
  private getFieldProperty(obj: object, key: string): unknown {
    if (Object.hasOwn(obj, key)) {
      return Object.getOwnPropertyDescriptor(obj, key)?.value
    }
    return null
  }

  /**
   * 型固有のデフォルト値を取得（イミュータブル）
   */
  private getTypeSpecificDefaults(
    field: object,
    fieldType: DocSchemaFieldTypeValue,
  ): Record<string, unknown> {
    const defaults: Record<string, unknown> = {}

    // リレーション型の場合、pathが必要
    if (fieldType.isRelation) {
      defaults.path = this.getFieldProperty(field, "path") ?? ""
    }

    // 選択型の場合、optionsが必要
    if (fieldType.isSelect) {
      defaults.options = this.getFieldProperty(field, "options") ?? []
    }

    return defaults
  }
}
