import type {
  DocFileIndexSchemaField,
  DocSchemaFieldText,
  RecordKey,
} from "@/types"

/**
 * Single text type schema field
 */
export class DocSchemaFieldTextValue<T extends RecordKey> {
  constructor(
    readonly key: T,
    readonly value: DocSchemaFieldText,
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

  readonly isArray = false

  readonly isSingle = true

  readonly isText = true

  toJson(): DocFileIndexSchemaField {
    return { ...this.value }
  }

  /**
   * Validate value type
   */
  validate(value: unknown): boolean {
    return typeof value === "string"
  }

  static empty(key: RecordKey): DocSchemaFieldTextValue<RecordKey> {
    return new DocSchemaFieldTextValue(key, {
      type: "text",
      required: false,
      title: null,
      description: null,
      default: null,
    })
  }

  static normalize(
    key: RecordKey,
    record: Record<RecordKey, unknown>,
  ): DocSchemaFieldTextValue<RecordKey> {
    const value = record as DocSchemaFieldText
    return new DocSchemaFieldTextValue(key, {
      type: value.type,
      required: value.required,
      title: value.title ?? null,
      description: value.description ?? null,
      default: value.default ?? null,
    })
  }
}
