import {
  zDocSchemaField,
  zDocSchemaFieldBoolean,
  zDocSchemaFieldMultiBoolean,
  zDocSchemaFieldMultiNumber,
  zDocSchemaFieldMultiRelation,
  zDocSchemaFieldMultiSelectNumber,
  zDocSchemaFieldMultiSelectText,
  zDocSchemaFieldMultiText,
  zDocSchemaFieldNumber,
  zDocSchemaFieldRelation,
  zDocSchemaFieldSelectNumber,
  zDocSchemaFieldSelectText,
  zDocSchemaFieldText,
} from "../models"
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
    // データが完全であることを前提とする
    const validated = field

    if (validated.type === "text") {
      const textField = zDocSchemaFieldText.parse(validated)
      return new DocSchemaFieldTextSingleValue(key, textField)
    }

    if (validated.type === "multi-text") {
      const multiTextField = zDocSchemaFieldMultiText.parse(validated)
      return new DocSchemaFieldTextMultipleValue(key, multiTextField)
    }

    if (validated.type === "number") {
      const numberField = zDocSchemaFieldNumber.parse(validated)
      return new DocSchemaFieldNumberSingleValue(key, numberField)
    }

    if (validated.type === "multi-number") {
      const multiNumberField = zDocSchemaFieldMultiNumber.parse(validated)
      return new DocSchemaFieldNumberMultipleValue(key, multiNumberField)
    }

    if (validated.type === "boolean") {
      const booleanField = zDocSchemaFieldBoolean.parse(validated)
      return new DocSchemaFieldBooleanSingleValue(key, booleanField)
    }

    if (validated.type === "multi-boolean") {
      const multiBooleanField = zDocSchemaFieldMultiBoolean.parse(validated)
      return new DocSchemaFieldBooleanMultipleValue(key, multiBooleanField)
    }

    if (validated.type === "select-text") {
      const selectTextField = zDocSchemaFieldSelectText.parse(validated)
      return new DocSchemaFieldSelectTextSingleValue(key, selectTextField)
    }

    if (validated.type === "select-number") {
      const selectNumberField = zDocSchemaFieldSelectNumber.parse(validated)
      return new DocSchemaFieldSelectNumberSingleValue(key, selectNumberField)
    }

    if (validated.type === "multi-select-text") {
      const multiSelectTextField =
        zDocSchemaFieldMultiSelectText.parse(validated)
      return new DocSchemaFieldSelectTextMultipleValue(
        key,
        multiSelectTextField,
      )
    }

    if (validated.type === "multi-select-number") {
      const multiSelectNumberField =
        zDocSchemaFieldMultiSelectNumber.parse(validated)
      return new DocSchemaFieldSelectNumberMultipleValue(
        key,
        multiSelectNumberField,
      )
    }

    if (validated.type === "relation") {
      const relationField = zDocSchemaFieldRelation.parse(validated)
      return new DocSchemaFieldRelationSingleValue(key, relationField)
    }

    if (validated.type === "multi-relation") {
      const multiRelationField = zDocSchemaFieldMultiRelation.parse(validated)
      return new DocSchemaFieldRelationMultipleValue(key, multiRelationField)
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

    const fieldObj = field
    const fieldType = this.getFieldProperty(fieldObj, "type")
    const fieldRequired = this.getFieldProperty(fieldObj, "required")
    const fieldTitle = this.getFieldProperty(fieldObj, "title")
    const fieldDescription = this.getFieldProperty(fieldObj, "description")
    const fieldDefault = this.getFieldProperty(fieldObj, "default")

    // 型の正規化
    const normalizedType = this.normalizeType(fieldType)
    const typeValue = DocSchemaFieldTypeValue.from(normalizedType)

    // 正規化されたフィールドを構築
    const baseField = {
      type: normalizedType,
      required: fieldRequired ?? false,
      title: fieldTitle !== undefined ? fieldTitle : null,
      description: fieldDescription !== undefined ? fieldDescription : null,
      default: fieldDefault !== undefined ? fieldDefault : null,
    }

    // 型固有のデフォルト値を追加
    return {
      ...baseField,
      ...this.getTypeSpecificDefaults(fieldObj, typeValue),
    }
  }

  /**
   * デフォルトのテキストフィールドを作成
   */
  private createDefaultTextField(): Record<string, unknown> {
    return {
      type: "text",
      required: false,
      title: "",
      description: "",
      default: "",
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
    return undefined
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
      defaults.path = this.getFieldProperty(field, "path") || ""
    }

    // 選択型の場合、optionsが必要
    if (fieldType.isSelect) {
      defaults.options = this.getFieldProperty(field, "options") || []
    }

    return defaults
  }
}
