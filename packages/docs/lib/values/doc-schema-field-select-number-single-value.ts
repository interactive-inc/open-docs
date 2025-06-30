import type { DocSchemaField } from "../types"

/**
 * 単一選択数値型スキーマフィールド
 */
export class DocSchemaFieldSelectNumberSingleValue {
  constructor(
    readonly key: string,
    readonly value: DocSchemaField & {
      type: "select-number"
      options: number[]
    },
  ) {
    Object.freeze(this)
    Object.freeze(this.value)
    Object.freeze(this.value.options)
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

  get isArray() {
    return false
  }

  get isSingle() {
    return true
  }

  get isSelect() {
    return true
  }

  get isNumberSelect() {
    return true
  }

  /**
   * 値を検証する
   */
  validate(value: unknown): boolean {
    return typeof value === "number"
  }

  toJson(): DocSchemaField {
    return { ...this.value }
  }
}
