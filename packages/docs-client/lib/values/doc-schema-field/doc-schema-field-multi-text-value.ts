import type {
  DocFileIndexSchemaField,
  DocSchemaFieldMultiText,
  RecordKey,
} from "../../types"

/**
 * Multiple text type schema field
 */
export class DocSchemaFieldMultiTextValue<T extends RecordKey> {
  constructor(
    readonly key: T,
    readonly value: DocSchemaFieldMultiText,
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

  readonly isText = true

  toJson(): DocFileIndexSchemaField {
    return { ...this.value }
  }

  /**
   * Validate value type
   */
  validate(value: unknown): boolean {
    return Array.isArray(value) && value.every((v) => typeof v === "string")
  }

  static empty<T extends RecordKey>(key: T): DocSchemaFieldMultiTextValue<T> {
    return new DocSchemaFieldMultiTextValue(key, {
      type: "multi-text",
      required: false,
      title: null,
      description: null,
      default: null,
    })
  }

  static normalize(
    key: RecordKey,
    record: Record<RecordKey, unknown>,
  ): DocSchemaFieldMultiTextValue<RecordKey> {
    const value = record as DocSchemaFieldMultiText
    return new DocSchemaFieldMultiTextValue(key, {
      type: value.type,
      required: value.required,
      title: value.title ?? null,
      description: value.description ?? null,
      default: value.default ?? null,
    })
  }
}
