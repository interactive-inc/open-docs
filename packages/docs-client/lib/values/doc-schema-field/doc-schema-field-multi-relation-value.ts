import type {
  DocFileIndexSchemaField,
  DocSchemaFieldMultiRelation,
  RecordKey,
} from "@/types"

/**
 * Multiple relation type schema field
 */
export class DocSchemaFieldMultiRelationValue<T extends RecordKey> {
  constructor(
    readonly key: T,
    readonly value: DocSchemaFieldMultiRelation,
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

  readonly isArray = true

  readonly isSingle = false

  readonly isRelation = true

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
  ): DocSchemaFieldMultiRelationValue<T> {
    return new DocSchemaFieldMultiRelationValue(key, {
      type: "multi-relation",
      required: false,
      title: null,
      description: null,
      default: null,
      path: "",
    })
  }

  static normalize(
    key: RecordKey,
    record: Record<RecordKey, unknown>,
  ): DocSchemaFieldMultiRelationValue<RecordKey> {
    const value = record as DocSchemaFieldMultiRelation
    return new DocSchemaFieldMultiRelationValue(key, {
      type: value.type,
      required: value.required,
      title: value.title ?? null,
      description: value.description ?? null,
      default: value.default ?? null,
      path: value.path ?? "",
    })
  }
}
