import type { DocFieldMultiNumber, DocSchemaField } from "../types"

/**
 * 数値複数型スキーマフィールド
 */
export class DocSchemaFieldNumberMultipleValue {
  constructor(
    readonly key: string,
    readonly value: DocFieldMultiNumber,
  ) {
    Object.freeze(this)
    Object.freeze(this.value)
    if (this.value.default) {
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

  readonly isArray = true

  readonly isSingle = false

  readonly isNumber = true

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
