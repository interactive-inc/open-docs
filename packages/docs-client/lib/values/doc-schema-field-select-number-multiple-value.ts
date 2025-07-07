import type { DocSchemaField, DocSchemaFieldMultiSelectNumber } from "../types"

/**
 * 数値選択複数型スキーマフィールド
 */
export class DocSchemaFieldSelectNumberMultipleValue {
  constructor(
    readonly key: string,
    readonly value: DocSchemaFieldMultiSelectNumber,
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

  get options(): number[] {
    return this.value.options
  }

  readonly isArray = true

  readonly isSingle = false

  readonly isSelect = true

  readonly isNumberSelect = true

  /**
   * 値を検証する
   */
  validate(value: unknown): boolean {
    return Array.isArray(value) && value.every((v) => typeof v === "number")
  }

  toJson(): DocSchemaField {
    return { ...this.value }
  }
}
