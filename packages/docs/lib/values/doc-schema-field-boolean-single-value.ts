import type { DocSchemaField, DocSchemaFieldBoolean } from "../types"

/**
 * 単一ブール型スキーマフィールド
 */
export class DocSchemaFieldBooleanSingleValue {
  constructor(
    readonly key: string,
    readonly value: DocSchemaFieldBoolean,
  ) {
    Object.freeze(this)
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

  readonly isArray = false

  readonly isSingle = true

  readonly isBoolean = true

  toJson(): DocSchemaField {
    return { ...this.value }
  }

  /**
   * 値の型を検証する
   */
  validate(value: unknown): boolean {
    return typeof value === "boolean"
  }
}
