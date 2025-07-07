import type { DocFieldMultiText, DocSchemaField } from "../types"

/**
 * テキスト複数型スキーマフィールド
 */
export class DocSchemaFieldTextMultipleValue {
  constructor(
    readonly key: string,
    readonly value: DocFieldMultiText,
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

  readonly isText = true

  toJson(): DocSchemaField {
    return { ...this.value }
  }

  /**
   * 値の型を検証する
   */
  validate(value: unknown): boolean {
    return Array.isArray(value) && value.every((v) => typeof v === "string")
  }
}
