import type { DocSchemaField, DocSchemaFieldSelectText } from "../types"

/**
 * 単一選択テキスト型スキーマフィールド
 */
export class DocSchemaFieldSelectTextSingleValue {
  constructor(
    readonly key: string,
    readonly value: DocSchemaFieldSelectText,
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

  readonly isArray = false

  readonly isSingle = true

  readonly isSelect = true

  readonly isTextSelect = true

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
