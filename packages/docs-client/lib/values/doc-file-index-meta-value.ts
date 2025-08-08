import { parse, stringify } from "yaml"
import { INDEX_META } from "@/constants"
import { zDocFileIndexMeta } from "@/models"
import type {
  DocClientConfig,
  DocCustomSchema,
  DocFileIndexMeta,
  DocFileIndexSchema,
  RecordKey,
} from "@/types"
import { DocFileIndexSchemaFieldFactory } from "@/values/doc-file-index-schema-field-factory"
import { DocFileIndexSchemaValue } from "./doc-file-index-schema-value"

/**
 * File: index.md > content > FrontMatter
 */
export class DocFileIndexMetaValue<T extends DocCustomSchema> {
  constructor(
    readonly value: DocFileIndexMeta<T>,
    readonly customSchema: T,
    private readonly config: DocClientConfig,
    private readonly additionalProperties: Record<string, unknown> = {},
  ) {
    zDocFileIndexMeta.parse(value)
    Object.freeze(this)
  }

  /**
   * Get icon
   */
  get icon(): string | null {
    return this.value.icon
  }

  /**
   * Get schema
   */
  schema(): DocFileIndexSchemaValue<T> {
    return new DocFileIndexSchemaValue(this.value.schema, this.customSchema)
  }

  /**
   * Check if schema is defined
   */
  get hasSchema(): boolean {
    return Object.keys(this.value.schema).length > 0
  }

  /**
   * Update icon field
   */
  withIcon(value: string | null): DocFileIndexMetaValue<T> {
    return new DocFileIndexMetaValue(
      { ...this.value, icon: value },
      this.customSchema,
      this.config,
      this.additionalProperties,
    )
  }

  /**
   * Update schema field
   */
  withSchema(value: DocFileIndexSchema<keyof T>): DocFileIndexMetaValue<T> {
    return new DocFileIndexMetaValue(
      { ...this.value, schema: value },
      this.customSchema,
      this.config,
      this.additionalProperties,
    )
  }

  /**
   * Return a new instance with an unknown schema
   * Allows accepting Record<string, unknown> schemas from external sources
   */
  withUnknownSchema(
    draft: Record<string, unknown>,
  ): DocFileIndexMetaValue<DocCustomSchema> {
    // Cast the unknown schema to the expected type
    const typedSchema = draft as DocFileIndexSchema<string>

    return new DocFileIndexMetaValue<DocCustomSchema>(
      {
        type: INDEX_META,
        icon: this.value.icon,
        schema: typedSchema,
      },
      {} as DocCustomSchema,
      this.config,
      this.additionalProperties,
    )
  }

  /**
   * Output in JSON format
   */
  toJson(): DocFileIndexMeta<T> {
    return this.value
  }

  /**
   * Output in YAML format
   */
  toYaml(): string {
    const json = {
      icon: this.value.icon,
      schema: this.value.schema,
      ...this.additionalProperties,
    }
    return stringify(json).trim()
  }

  /**
   * Generate from Markdown text (can process incomplete data)
   */
  static from<T extends DocCustomSchema>(
    markdownText: string,
    customSchema: T,
    config: DocClientConfig,
  ): DocFileIndexMetaValue<T> {
    if (markdownText.startsWith("---") === false) {
      return DocFileIndexMetaValue.empty(customSchema, config)
    }

    const endIndex = markdownText.indexOf("\n---", 3)

    if (endIndex === -1) {
      return DocFileIndexMetaValue.empty(customSchema, config)
    }

    const frontMatterText = markdownText.slice(4, endIndex).trim()

    const record = parse(frontMatterText) || {}

    return DocFileIndexMetaValue.fromRecord(record, customSchema, config)
  }

  /**
   * Generate directly from data (can process incomplete data)
   */
  static fromRecord<T extends DocCustomSchema>(
    record: Record<string, unknown>,
    customSchema: T,
    config: DocClientConfig,
  ): DocFileIndexMetaValue<T> {
    const icon = DocFileIndexMetaValue.extractIcon(record, config)

    const indexSchema = DocFileIndexMetaValue.extractSchema<T>(
      record,
      customSchema,
    )

    // Extract additional properties specified in indexMetaIncludes
    const additionalProperties: Record<string, unknown> = {}
    for (const key of config.indexMetaIncludes) {
      if (key in record && key !== "icon" && key !== "schema") {
        additionalProperties[key] = record[key]
      }
    }

    const indexMeta: DocFileIndexMeta<T> = {
      type: "index-meta",
      icon,
      schema: indexSchema,
    }

    return new DocFileIndexMetaValue<T>(
      indexMeta,
      customSchema,
      config,
      additionalProperties,
    )
  }

  /**
   * Generate empty FrontMatter
   */
  static empty<T extends DocCustomSchema>(
    customSchema: T,
    config: DocClientConfig,
  ): DocFileIndexMetaValue<T> {
    return new DocFileIndexMetaValue<T>(
      {
        type: "index-meta",
        icon: config.defaultIndexIcon,
        schema: DocFileIndexMetaValue.emptySchema(customSchema),
      },
      customSchema,
      config,
      {},
    )
  }

  /**
   * Extract icon
   */
  private static extractIcon(
    data: Record<string, unknown>,
    config: DocClientConfig,
  ): string {
    if ("icon" in data && typeof data.icon === "string") {
      return data.icon
    }

    return config.defaultIndexIcon
  }

  /**
   * Extract schema part
   */
  private static extractSchema<T extends DocCustomSchema>(
    record: Record<string, unknown>,
    customSchema: T,
  ): DocFileIndexSchema<keyof T> {
    const hasSchema = "schema" in record

    if (hasSchema === false) {
      return DocFileIndexMetaValue.emptySchema<T>(customSchema)
    }

    if (typeof record.schema !== "object" || record.schema === null) {
      return DocFileIndexMetaValue.emptySchema<T>(customSchema)
    }

    return DocFileIndexMetaValue.normalizeSchema<T>(
      record.schema as never,
      customSchema,
    )
  }

  /**
   * Normalize entire schema
   */
  private static normalizeSchema<T extends DocCustomSchema>(
    schema: Record<RecordKey, unknown>,
    customSchema: T,
  ): DocFileIndexSchema<keyof T> {
    const factory = new DocFileIndexSchemaFieldFactory()

    // Process all keys from the actual schema when customSchema is empty
    if (Object.keys(customSchema).length === 0) {
      const dynamicRecord: Record<string, unknown> = {}
      for (const key of Object.keys(schema)) {
        const schemaValue = schema[key]
        if (schemaValue !== undefined && schemaValue !== null) {
          const field = factory.from(key, schemaValue as never)
          // Ensure required field has a default value
          const normalizedValue = {
            ...field.value,
            required: field.value.required ?? false,
          }
          dynamicRecord[key] = normalizedValue
        }
      }
      return dynamicRecord as DocFileIndexSchema<keyof T>
    }

    // Use customSchema keys when provided
    const record = {} as DocFileIndexSchema<keyof T>
    const customSchemaKeys = Object.keys(customSchema) as Array<keyof T>
    for (const key of customSchemaKeys) {
      const schemaValue = schema[key as keyof typeof schema]
      const field = factory.from(key, schemaValue as never)
      // Ensure required field has a default value for customSchema path too
      const normalizedValue = {
        ...field.value,
        required: field.value.required ?? false,
      }
      record[key] = normalizedValue
    }
    return record
  }

  static emptySchema<T extends DocCustomSchema>(
    customSchema: T,
  ): DocFileIndexSchema<keyof T> {
    const record = {} as DocFileIndexSchema<keyof T>

    const customSchemaKeys = Object.keys(customSchema) as Array<keyof T>

    const factory = new DocFileIndexSchemaFieldFactory()

    for (const key of customSchemaKeys) {
      const field = customSchema[key]
      const customSchemaField = factory.empty(key, field.type)
      // Ensure required field has a default value
      const normalizedValue = {
        ...customSchemaField.value,
        required: customSchemaField.value.required ?? false,
      }
      record[key] = normalizedValue
    }

    return record
  }
}
