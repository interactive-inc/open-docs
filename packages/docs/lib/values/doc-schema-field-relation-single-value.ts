import type { DocSchemaField, DocSchemaFieldRelation } from "../types"

/**
 * 単一リレーション型スキーマフィールド
 */
export class DocSchemaFieldRelationSingleValue {
  constructor(
    readonly key: string,
    readonly value: DocSchemaFieldRelation,
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

  get path(): string {
    return this.value.path
  }

  readonly isArray = false

  readonly isSingle = true

  readonly isRelation = true

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
