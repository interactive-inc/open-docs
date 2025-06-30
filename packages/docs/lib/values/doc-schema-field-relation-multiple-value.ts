import type { DocSchemaField } from "../types"

/**
 * リレーション複数型スキーマフィールド
 */
export class DocSchemaFieldRelationMultipleValue {
  constructor(
    readonly key: string,
    readonly value: DocSchemaField & {
      type: "multi-relation"
      path: string
    },
  ) {
    Object.freeze(this.value)
    if (this.value.default && Array.isArray(this.value.default)) {
      Object.freeze(this.value.default)
    }
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

  get path(): string {
    return this.value.path
  }

  get isArray() {
    return true
  }

  get isSingle() {
    return false
  }

  get isRelation() {
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
