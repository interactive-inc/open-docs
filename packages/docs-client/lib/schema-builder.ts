import type { DocCustomSchema } from "./types"

/**
 * Schema builder
 * Build schemas in a chain style
 *
 * @example
 * const schema = new SchemaBuilder()
 *   .text("title", true)
 *   .multiRelation("features", true)
 *   .selectText("priority", false)
 *   .build()
 */
export class SchemaBuilder<T extends DocCustomSchema> {
  constructor(private schema: T = {} as T) {}

  text<K extends string>(
    key: K,
    required: boolean,
  ): SchemaBuilder<T & Record<K, { type: "text"; required: boolean }>> {
    return new SchemaBuilder({
      ...this.schema,
      [key]: { type: "text", required },
    })
  }

  number<K extends string>(
    key: K,
    required: boolean,
  ): SchemaBuilder<T & Record<K, { type: "number"; required: boolean }>> {
    return new SchemaBuilder({
      ...this.schema,
      [key]: { type: "number", required },
    })
  }

  boolean<K extends string>(
    key: K,
    required: boolean,
  ): SchemaBuilder<T & Record<K, { type: "boolean"; required: boolean }>> {
    return new SchemaBuilder({
      ...this.schema,
      [key]: { type: "boolean", required },
    })
  }

  relation<K extends string>(
    key: K,
    required: boolean,
  ): SchemaBuilder<T & Record<K, { type: "relation"; required: boolean }>> {
    return new SchemaBuilder({
      ...this.schema,
      [key]: { type: "relation", required },
    })
  }

  multiRelation<K extends string>(
    key: K,
    required: boolean,
  ): SchemaBuilder<
    T & Record<K, { type: "multi-relation"; required: boolean }>
  > {
    return new SchemaBuilder({
      ...this.schema,
      [key]: { type: "multi-relation", required },
    })
  }

  selectText<K extends string>(
    key: K,
    required: boolean,
  ): SchemaBuilder<T & Record<K, { type: "select-text"; required: boolean }>> {
    return new SchemaBuilder({
      ...this.schema,
      [key]: { type: "select-text", required },
    })
  }

  selectNumber<K extends string>(
    key: K,
    required: boolean,
  ): SchemaBuilder<
    T & Record<K, { type: "select-number"; required: boolean }>
  > {
    return new SchemaBuilder({
      ...this.schema,
      [key]: { type: "select-number", required },
    })
  }

  multiText<K extends string>(
    key: K,
    required: boolean,
  ): SchemaBuilder<T & Record<K, { type: "multi-text"; required: boolean }>> {
    return new SchemaBuilder({
      ...this.schema,
      [key]: { type: "multi-text", required },
    })
  }

  multiNumber<K extends string>(
    key: K,
    required: boolean,
  ): SchemaBuilder<T & Record<K, { type: "multi-number"; required: boolean }>> {
    return new SchemaBuilder({
      ...this.schema,
      [key]: { type: "multi-number", required },
    })
  }

  multiSelectText<K extends string>(
    key: K,
    required: boolean,
  ): SchemaBuilder<
    T & Record<K, { type: "multi-select-text"; required: boolean }>
  > {
    return new SchemaBuilder({
      ...this.schema,
      [key]: { type: "multi-select-text", required },
    })
  }

  multiSelectNumber<K extends string>(
    key: K,
    required: boolean,
  ): SchemaBuilder<
    T & Record<K, { type: "multi-select-number"; required: boolean }>
  > {
    return new SchemaBuilder({
      ...this.schema,
      [key]: { type: "multi-select-number", required },
    })
  }

  build(): T {
    return this.schema
  }
}
