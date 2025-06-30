import type { DocSchemaField } from "../types"

/**
 * 単一テキスト型スキーマフィールド
 */
export class DocSchemaFieldTextSingleValue {
  constructor(
    readonly key: string,
    readonly value: DocSchemaField & { type: "text" },
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

  get default(): string | null {
    return this.value.default
  }

  get isArray() {
    return false
  }

  get isSingle() {
    return true
  }

  get isText() {
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
