import type {
  DocFileIndexSchemaField,
  DocSchemaFieldMultiSelectText,
  RecordKey,
} from "@/types"

/**
 * Multiple select text type schema field
 */
export class DocSchemaFieldMultiSelectTextValue<T extends RecordKey> {
  constructor(
    readonly key: T,
    readonly value: DocSchemaFieldMultiSelectText,
  ) {
    Object.freeze(this)
    Object.freeze(this.value)
    Object.freeze(this.value.options)
    if (this.value.default && Array.isArray(this.value.default)) {
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

  get options(): string[] {
    return this.value.options
  }

  readonly isArray = true

  readonly isSingle = false

  readonly isSelect = true

  readonly isTextSelect = true

  /**
   * Validate value
   */
  validate(value: unknown): boolean {
    return Array.isArray(value) && value.every((v) => typeof v === "string")
  }

  toJson(): DocFileIndexSchemaField {
    return { ...this.value }
  }

  static empty<T extends RecordKey>(
    key: T,
  ): DocSchemaFieldMultiSelectTextValue<T> {
    return new DocSchemaFieldMultiSelectTextValue(key, {
      type: "multi-select-text",
      required: false,
      title: null,
      description: null,
      default: null,
      options: [],
    })
  }

  static normalize(
    key: RecordKey,
    record: Record<RecordKey, unknown>,
  ): DocSchemaFieldMultiSelectTextValue<RecordKey> {
    const value = record as DocSchemaFieldMultiSelectText
    return new DocSchemaFieldMultiSelectTextValue(key, {
      type: value.type,
      required: value.required,
      title: value.title ?? null,
      description: value.description ?? null,
      default: value.default ?? null,
      options: value.options ?? [],
    })
  }
}
