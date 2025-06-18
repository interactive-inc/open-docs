import { zDocSchemaField } from "@/lib/models"
import type { DocSchemaField } from "@/lib/types"
import { DocSchemaFieldTypeValue } from "./doc-schema-field-type-value"

/**
 * スキーマフィールド
 */
export class DocSchemaFieldValue {
  constructor(
    readonly key: string,
    readonly value: DocSchemaField,
  ) {
    zDocSchemaField.parse(value)
    Object.freeze(this)
  }

  /**
   * フィールドタイプを取得
   */
  get type() {
    return new DocSchemaFieldTypeValue(this.value.type)
  }

  /**
   * 必須かどうか
   */
  get required() {
    return this.value.required
  }

  /**
   * タイトルを取得
   */
  get title() {
    return this.value.title
  }

  /**
   * 説明を取得
   */
  get description() {
    return this.value.description
  }

  /**
   * デフォルト値を取得
   */
  get default() {
    return this.value.default
  }

  /**
   * リレーションのパスを取得（リレーション型の場合）
   */
  get path(): string | undefined {
    if ("path" in this.value) {
      return this.value.path
    }
    return undefined
  }

  /**
   * 選択肢を取得（選択型の場合）
   */
  get options(): string[] | number[] | undefined {
    if ("options" in this.value) {
      return this.value.options
    }
    return undefined
  }

  /**
   * リレーション型かどうか
   */
  get isRelation() {
    return this.type.isRelation
  }

  /**
   * 選択型かどうか
   */
  get isSelect() {
    return this.type.isSelect
  }

  /**
   * 配列型かどうか
   */
  get isArray() {
    return this.type.isArray
  }

  /**
   * デフォルト値を取得（型に応じた適切な値）
   */
  getDefaultValue(): unknown {
    if (this.default !== undefined) {
      return this.default
    }
    return this.type.getDefaultValue()
  }

  /**
   * 値の検証
   */
  validateValue(value: unknown): boolean {
    // 必須チェック
    if (
      this.required &&
      (value === null || value === undefined || value === "")
    ) {
      return false
    }

    // 型チェック
    if (!this.type.validateValue(value)) {
      return false
    }

    // 選択肢チェック
    if (this.isSelect && this.options) {
      const options = this.options
      if (this.type.isArray) {
        const arrayValue = value as unknown[]
        return arrayValue.every((item) => options.includes(item as never))
      }
      return options.includes(value as never)
    }

    return true
  }

  /**
   * フィールド名とキーを含めて生成
   */
  static fromSchemaEntry(key: string, field: DocSchemaField) {
    return new DocSchemaFieldValue(key, field)
  }

  /**
   * 未検証のデータから正規化して生成
   */
  static fromUnknown(key: string, data: unknown): DocSchemaFieldValue {
    const normalized = DocSchemaFieldValue.normalizeField(data)
    const validated = zDocSchemaField.parse(normalized)
    return new DocSchemaFieldValue(key, validated)
  }

  /**
   * JSON形式に変換
   */
  toJson(): DocSchemaField {
    return { ...this.value }
  }

  /**
   * フィールド定義を正規化
   */
  private static normalizeField(field: unknown): Record<string, unknown> {
    if (!field || typeof field !== "object") {
      // オブジェクトでない場合はデフォルトのテキストフィールドとして扱う
      return DocSchemaFieldValue.createDefaultTextField()
    }

    const fieldObj = { ...field } as Record<string, unknown>

    // 型の正規化
    const normalizedType = DocSchemaFieldValue.normalizeType(fieldObj.type)
    const typeValue = new DocSchemaFieldTypeValue(normalizedType as never)

    // 正規化されたフィールドを構築
    const baseField = {
      type: normalizedType,
      required: fieldObj.required ?? false,
      title: fieldObj.title ?? "",
      description: fieldObj.description ?? "",
      default: fieldObj.default ?? typeValue.getDefaultValue(),
    }

    // 型固有のデフォルト値を追加
    return {
      ...baseField,
      ...DocSchemaFieldValue.getTypeSpecificDefaults(fieldObj, typeValue),
    }
  }

  /**
   * デフォルトのテキストフィールドを作成
   */
  private static createDefaultTextField(): Record<string, unknown> {
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
  private static normalizeType(type: unknown): string {
    if (typeof type !== "string") return "text"

    // 旧型名から新型名への変換
    if (type === "string") return "text"
    if (type === "multi-string") return "multi-text"

    return type
  }

  /**
   * 型固有のデフォルト値を取得（イミュータブル）
   */
  private static getTypeSpecificDefaults(
    field: Record<string, unknown>,
    fieldType: DocSchemaFieldTypeValue,
  ): Record<string, unknown> {
    const defaults: Record<string, unknown> = {}

    // リレーション型の場合、pathが必要
    if (fieldType.isRelation) {
      defaults.path = field.path || ""
    }

    // 選択型の場合、optionsが必要
    if (fieldType.isSelect) {
      defaults.options = field.options || []
    }

    return defaults
  }
}
