import type { DocSchemaField, DocSchemaFieldMultiSelectText } from "../types"

/**
 * テキスト選択複数型スキーマフィールド
 */
export class DocSchemaFieldSelectTextMultipleValue {
  constructor(
    readonly key: string,
    readonly value: DocSchemaFieldMultiSelectText,
  ) {
    Object.freeze(this)
    Object.freeze(this.value)
    Object.freeze(this.value.options)
    if (this.value.default && Array.isArray(this.value.default)) {
      Object.freeze(this.value.default)
    }
  }

  get type() {
    return this.value.type
  }

  get required() {
    return this.value.required
  }

  get title() {
    return this.value.title ?? ""
  }

  get description() {
    return this.value.description ?? ""
  }

  get default() {
    return this.value.default
  }

  get options(): string[] {
    return this.value.options
  }

  readonly isArray = true

  readonly isSingle = false

  readonly isSelect = true

  readonly isTextSelect = true

  /**
   * 値を検証する
   */
  validate(value: unknown): boolean {
    return Array.isArray(value) && value.every((v) => typeof v === "string")
  }

  toJson(): DocSchemaField {
    return { ...this.value }
  }
}
