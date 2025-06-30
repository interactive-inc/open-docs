import type { DocSchemaField } from "../types"

/**
 * 単一選択テキスト型スキーマフィールド
 */
export class DocSchemaFieldSelectTextSingleValue {
  constructor(
    readonly key: string,
    readonly value: DocSchemaField & {
      type: "select-text"
      options: string[]
    },
  ) {
    if (this.value.options) {
      Object.freeze(this.value.options)
    }
    Object.freeze(this.value)
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

  get options(): string[] {
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

  get isTextSelect() {
    return true
  }

  toJson(): DocSchemaField {
    return { ...this.value }
  }

  /**
   * 値の型を検証する
   */
  validate(value: unknown): boolean {
    return typeof value === "string"
  }
}
