import type { DocSchemaField } from "../types"

/**
 * ブール複数型スキーマフィールド
 */
export class DocSchemaFieldBooleanMultipleValue {
  constructor(
    readonly key: string,
    readonly value: DocSchemaField & { type: "multi-boolean" },
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

  get isArray() {
    return true
  }

  get isSingle() {
    return false
  }

  get isBoolean() {
    return true
  }

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
