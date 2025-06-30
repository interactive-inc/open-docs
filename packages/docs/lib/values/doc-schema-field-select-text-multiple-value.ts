import type { DocSchemaField } from "../types"

/**
 * テキスト選択複数型スキーマフィールド
 */
export class DocSchemaFieldSelectTextMultipleValue {
  constructor(
    readonly key: string,
    readonly value: DocSchemaField & {
      type: "multi-select-text"
      options: string[]
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

  get options(): string[] {
    return this.value.options
  }

  get isArray() {
    return true
  }

  get isSingle() {
    return false
  }

  get isSelect() {
    return true
  }

  get isTextSelect() {
    return true
  }

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
