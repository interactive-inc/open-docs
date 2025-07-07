import type { DocFieldMultiBoolean, DocSchemaField } from "../types"

/**
 * ブール複数型スキーマフィールド
 */
export class DocSchemaFieldBooleanMultipleValue {
  constructor(
    readonly key: string,
    readonly value: DocFieldMultiBoolean,
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

  readonly isBoolean = true

  /**
   * 値を検証する
   */
  validate(value: unknown): boolean {
    return Array.isArray(value) && value.every((v) => typeof v === "boolean")
  }

  toJson(): DocSchemaField {
    return { ...this.value }
  }
}
