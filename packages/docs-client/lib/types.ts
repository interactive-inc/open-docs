import type { z } from "zod"
import type {
  zDocClientConfig,
  zDocCustomSchemaField,
  zDocCustomSchemaFieldBoolean,
  zDocCustomSchemaFieldMultiNumber,
  zDocCustomSchemaFieldMultiRelation,
  zDocCustomSchemaFieldMultiSelectNumber,
  zDocCustomSchemaFieldMultiSelectText,
  zDocCustomSchemaFieldMultiText,
  zDocCustomSchemaFieldNumber,
  zDocCustomSchemaFieldRelation,
  zDocCustomSchemaFieldSelectNumber,
  zDocCustomSchemaFieldSelectText,
  zDocCustomSchemaFieldText,
  zDocFileIndexSchemaField,
  zDocFilePath,
  zDocFileUnknown,
  zDocMetaField,
  zDocMetaFieldBoolean,
  zDocMetaFieldMultiBoolean,
  zDocMetaFieldMultiNumber,
  zDocMetaFieldMultiRelation,
  zDocMetaFieldMultiSelectNumber,
  zDocMetaFieldMultiSelectText,
  zDocMetaFieldMultiText,
  zDocMetaFieldNumber,
  zDocMetaFieldRelation,
  zDocMetaFieldSelectNumber,
  zDocMetaFieldSelectText,
  zDocMetaFieldText,
  zDocMetaFieldType,
  zDocMetaFieldTypeBoolean,
  zDocMetaFieldTypeNumber,
  zDocMetaFieldTypeRelation,
  zDocMetaFieldTypeSelectNumber,
  zDocMetaFieldTypeSelectText,
  zDocMetaFieldTypeText,
  zDocRelation,
  zDocRelationField,
  zDocRelationFile,
  zDocSchemaFieldBoolean,
  zDocSchemaFieldMultiNumber,
  zDocSchemaFieldMultiRelation,
  zDocSchemaFieldMultiSelectNumber,
  zDocSchemaFieldMultiSelectText,
  zDocSchemaFieldMultiText,
  zDocSchemaFieldNumber,
  zDocSchemaFieldRelation,
  zDocSchemaFieldSelectNumber,
  zDocSchemaFieldSelectText,
  zDocSchemaFieldText,
} from "./models"
import type { DocSchemaFieldBooleanValue } from "./values/doc-schema-field/doc-schema-field-boolean-value"
import type { DocSchemaFieldMultiNumberValue } from "./values/doc-schema-field/doc-schema-field-multi-number-value"
import type { DocSchemaFieldMultiRelationValue } from "./values/doc-schema-field/doc-schema-field-multi-relation-value"
import type { DocSchemaFieldMultiSelectNumberValue } from "./values/doc-schema-field/doc-schema-field-multi-select-number-value"
import type { DocSchemaFieldMultiSelectTextValue } from "./values/doc-schema-field/doc-schema-field-multi-select-text-value"
import type { DocSchemaFieldMultiTextValue } from "./values/doc-schema-field/doc-schema-field-multi-text-value"
import type { DocSchemaFieldNumberValue } from "./values/doc-schema-field/doc-schema-field-number-value"
import type { DocSchemaFieldRelationValue } from "./values/doc-schema-field/doc-schema-field-relation-value"
import type { DocSchemaFieldSelectNumberValue } from "./values/doc-schema-field/doc-schema-field-select-number-value"
import type { DocSchemaFieldSelectTextValue } from "./values/doc-schema-field/doc-schema-field-select-text-value"
import type { DocSchemaFieldTextValue } from "./values/doc-schema-field/doc-schema-field-text-value"

/**
 * Text field type
 */
export type DocSchemaFieldText = z.infer<typeof zDocSchemaFieldText>

/**
 * Number field type
 */
export type DocSchemaFieldNumber = z.infer<typeof zDocSchemaFieldNumber>

/**
 * Boolean field type
 */
export type DocSchemaFieldBoolean = z.infer<typeof zDocSchemaFieldBoolean>

/**
 * Multi-text field type
 */
export type DocSchemaFieldMultiText = z.infer<typeof zDocSchemaFieldMultiText>

/**
 * Multi-number field type
 */
export type DocSchemaFieldMultiNumber = z.infer<
  typeof zDocSchemaFieldMultiNumber
>

/**
 * Relation field type
 */
export type DocSchemaFieldRelation = z.infer<typeof zDocSchemaFieldRelation>

/**
 * Multi-relation field type
 */
export type DocSchemaFieldMultiRelation = z.infer<
  typeof zDocSchemaFieldMultiRelation
>

/**
 * Select text field type
 */
export type DocSchemaFieldSelectText = z.infer<typeof zDocSchemaFieldSelectText>

/**
 * Select number field type
 */
export type DocSchemaFieldSelectNumber = z.infer<
  typeof zDocSchemaFieldSelectNumber
>

/**
 * Multi-select text field type
 */
export type DocSchemaFieldMultiSelectText = z.infer<
  typeof zDocSchemaFieldMultiSelectText
>

/**
 * Multi-select number field type
 */
export type DocSchemaFieldMultiSelectNumber = z.infer<
  typeof zDocSchemaFieldMultiSelectNumber
>

export type DocMetaField = z.infer<typeof zDocMetaField>

export type DocMetaFieldText = z.infer<typeof zDocMetaFieldText>

export type DocMetaFieldNumber = z.infer<typeof zDocMetaFieldNumber>

export type DocMetaFieldBoolean = z.infer<typeof zDocMetaFieldBoolean>

export type DocMetaFieldSelectText = z.infer<typeof zDocMetaFieldSelectText>

export type DocMetaFieldSelectNumber = z.infer<typeof zDocMetaFieldSelectNumber>

export type DocMetaFieldRelation = z.infer<typeof zDocMetaFieldRelation>

export type DocMetaFieldMultiText = z.infer<typeof zDocMetaFieldMultiText>

export type DocMetaFieldMultiNumber = z.infer<typeof zDocMetaFieldMultiNumber>

export type DocMetaFieldMultiBoolean = z.infer<typeof zDocMetaFieldMultiBoolean>

export type DocMetaFieldMultiSelectText = z.infer<
  typeof zDocMetaFieldMultiSelectText
>

export type DocMetaFieldMultiSelectNumber = z.infer<
  typeof zDocMetaFieldMultiSelectNumber
>

export type DocMetaFieldMultiRelation = z.infer<
  typeof zDocMetaFieldMultiRelation
>

export type DocFileMdMeta<T extends RecordKey> = Record<T, DocMetaField>

export type DocMetaFieldTypeText = z.infer<typeof zDocMetaFieldTypeText>

export type DocMetaFieldTypeNumber = z.infer<typeof zDocMetaFieldTypeNumber>

export type DocMetaFieldTypeBoolean = z.infer<typeof zDocMetaFieldTypeBoolean>

export type DocMetaFieldTypeSelectText = z.infer<
  typeof zDocMetaFieldTypeSelectText
>

export type DocMetaFieldTypeSelectNumber = z.infer<
  typeof zDocMetaFieldTypeSelectNumber
>

export type DocMetaFieldTypeRelation = z.infer<typeof zDocMetaFieldTypeRelation>

/**
 * Schema field type
 */
export type DocMetaFieldType = z.infer<typeof zDocMetaFieldType>

export type DocCustomSchemaFieldText = z.infer<typeof zDocCustomSchemaFieldText>

export type DocCustomSchemaFieldNumber = z.infer<
  typeof zDocCustomSchemaFieldNumber
>

export type DocCustomSchemaFieldBoolean = z.infer<
  typeof zDocCustomSchemaFieldBoolean
>

export type DocCustomSchemaFieldRelation = z.infer<
  typeof zDocCustomSchemaFieldRelation
>

export type DocCustomSchemaFieldSelectText = z.infer<
  typeof zDocCustomSchemaFieldSelectText
>

export type DocCustomSchemaFieldSelectNumber = z.infer<
  typeof zDocCustomSchemaFieldSelectNumber
>

export type DocCustomSchemaFieldMultiText = z.infer<
  typeof zDocCustomSchemaFieldMultiText
>

export type DocCustomSchemaFieldMultiNumber = z.infer<
  typeof zDocCustomSchemaFieldMultiNumber
>

export type DocCustomSchemaFieldMultiRelation = z.infer<
  typeof zDocCustomSchemaFieldMultiRelation
>

export type DocCustomSchemaFieldMultiSelectText = z.infer<
  typeof zDocCustomSchemaFieldMultiSelectText
>

export type DocCustomSchemaFieldMultiSelectNumber = z.infer<
  typeof zDocCustomSchemaFieldMultiSelectNumber
>

/**
 * Schema field type
 */
export type DocFileIndexSchemaField = z.infer<typeof zDocFileIndexSchemaField>

/**
 * Schema definition type
 */
export type DocFileIndexSchema<T extends RecordKey> = Record<
  T,
  DocFileIndexSchemaField
>

/**
 * Schema field to override
 * ex: { xxx: { type: "text", required: true } }
 */
export type DocCustomSchemaField = z.infer<typeof zDocCustomSchemaField>

/**
 * Minimal schema definition type
 */
export type DocCustomSchema<T extends RecordKey = RecordKey> = Record<
  T,
  DocCustomSchemaField
>

/**
 * Union type for relation fields
 */
export type DocSchemaRelationFieldUnion =
  | DocSchemaFieldRelation
  | DocSchemaFieldMultiRelation

/**
 * File node type (for files only)
 */
export type DocTreeFileNode = {
  type: "file"
  name: string
  path: string
  icon: string
  title: string
}

/**
 * Directory node type (for directories only)
 */
export type DocTreeDirectoryNode = {
  type: "directory"
  name: string
  path: string
  icon: string
  title: string
  children: DocTreeNode[]
}

/**
 * Unified tree node type
 */
export type DocTreeNode = DocTreeFileNode | DocTreeDirectoryNode

/**
 * Index file type
 */
export type DocFileIndex<T extends DocCustomSchema> = {
  type: "index"
  path: DocFilePath
  isArchived: boolean
  content: DocFileIndexContent<T>
}

/**
 * Type to check if two types are equal
 */
export type Equals<T, U> = (<G>() => G extends T ? 1 : 2) extends <
  G,
>() => G extends U ? 1 : 2
  ? true
  : false

/**
 * Extract relation field keys from schema
 */
export type RelationKeys<T extends DocCustomSchema> = {
  [K in keyof T]: T[K]["type"] extends "relation" ? K : never
}[keyof T]

/**
 * Extract multi-relation field keys from schema
 */
export type MultiRelationKeys<T extends DocCustomSchema> = {
  [K in keyof T]: T[K]["type"] extends "multi-relation" ? K : never
}[keyof T]

/**
 * Markdown file type (excluding index.md)
 */
export type DocFileMd<T extends DocCustomSchema> = {
  type: "markdown"
  path: DocFilePath
  isArchived: boolean
  content: DocFileMdContent<T>
}

/**
 * Other file type (non-markdown)
 */
export type DocFileUnknown = z.infer<typeof zDocFileUnknown>

/**
 * File union type (index.md, regular md, other)
 */
export type DocFile<T extends DocCustomSchema> =
  | DocFileIndex<T>
  | DocFileMd<T>
  | DocFileUnknown

/**
 * Directory FrontMatter type
 */
export type DocFileIndexMeta<T extends DocCustomSchema> = {
  type: "index-meta"
  icon: string | null
  schema: DocFileIndexSchema<keyof T>
}

/**
 * Relation options type
 */
export type DocRelationFile = z.infer<typeof zDocRelationFile>

/**
 * Relation information type
 */
export type DocRelation = z.infer<typeof zDocRelation>

/**
 * Relation field type
 */
export type DocRelationField = z.infer<typeof zDocRelationField>

/**
 * File path information type
 */
export type DocFilePath = z.infer<typeof zDocFilePath>

/**
 * Markdown content information type
 */
export type DocFileMdContent<T extends DocCustomSchema> = {
  type: "markdown-content"
  body: string
  title: string
  description: string
  meta: SchemaToValueType<T>
}

/**
 * Index file content information type
 */
export type DocFileIndexContent<T extends DocCustomSchema> = {
  type: "markdown-index"
  body: string
  title: string
  description: string
  meta: DocFileIndexMeta<T>
}

/**
 * Directory response type (re-export from server package)
 */
export type DocDirectory<T extends DocCustomSchema> = {
  cwd: string
  indexFile: DocFileIndex<T>
  files: DocFile<T>[]
  relations: DocRelation[]
}

export type RecordKey = string | number | symbol

/**
 * DocClient configuration
 */
export type DocClientConfig = z.infer<typeof zDocClientConfig>

/**
 * Type definitions for DocFileMdMetaValue
 */
export type ExtractFieldType<T> = T extends { type: infer Type } ? Type : never

export type ExtractRequired<T> = T extends { required: infer Required }
  ? Required
  : false

export type BaseFieldValueType<Type> = Type extends "text"
  ? string
  : Type extends "number"
    ? number
    : Type extends "boolean"
      ? boolean
      : Type extends "multi-text"
        ? string[]
        : Type extends "multi-number"
          ? number[]
          : Type extends "multi-boolean"
            ? boolean[]
            : Type extends "relation"
              ? string
              : Type extends "multi-relation"
                ? string[]
                : Type extends "select-text"
                  ? string
                  : Type extends "select-number"
                    ? number
                    : Type extends "multi-select-text"
                      ? string[]
                      : Type extends "multi-select-number"
                        ? number[]
                        : never

export type FieldValueType<Type, Required> = Required extends true
  ? BaseFieldValueType<Type>
  : BaseFieldValueType<Type> | null

/**
 * Extract required field keys
 */
export type RequiredKeys<T extends DocCustomSchema> = {
  [K in keyof T]: T[K] extends { required: true } ? K : never
}[keyof T]

/**
 * Extract optional field keys
 */
export type OptionalKeys<T extends DocCustomSchema> = {
  [K in keyof T]: T[K] extends { required: true } ? never : K
}[keyof T]

/**
 * Generate expected value type from schema (considering required)
 */
export type SchemaToValueType<T extends DocCustomSchema> =
  // Required fields
  {
    [K in RequiredKeys<T>]: BaseFieldValueType<ExtractFieldType<T[K]>>
  } & { [K in OptionalKeys<T>]?: BaseFieldValueType<ExtractFieldType<T[K]>> } // Optional fields

/**
 * Helper type for type-safe property access
 */
export type GetValueType<
  T extends DocCustomSchema,
  K extends keyof T,
> = K extends RequiredKeys<T>
  ? BaseFieldValueType<ExtractFieldType<T[K]>>
  : BaseFieldValueType<ExtractFieldType<T[K]>> | undefined

/**
 * Type definitions for DocFileIndexSchema
 */
export type ExtractIndexFieldType<T> = T extends { type: infer Type }
  ? Type
  : never

export type GetIndexFieldType<
  Schema extends DocFileIndexSchema<RecordKey>,
  K extends keyof Schema,
> = Schema[K] extends DocFileIndexSchemaField ? Schema[K] : never

// Get specific field type from DocFileIndexSchema
export type GetIndexFieldValueType<
  Schema extends DocFileIndexSchema<RecordKey>,
  K extends keyof Schema,
> = Schema[K] extends { type: infer Type }
  ? Type extends "text"
    ? DocSchemaFieldTextValue<K>
    : Type extends "number"
      ? DocSchemaFieldNumberValue<K>
      : Type extends "boolean"
        ? DocSchemaFieldBooleanValue<K>
        : Type extends "relation"
          ? DocSchemaFieldRelationValue<K>
          : Type extends "select-text"
            ? DocSchemaFieldSelectTextValue<K>
            : Type extends "select-number"
              ? DocSchemaFieldSelectNumberValue<K>
              : Type extends "multi-text"
                ? DocSchemaFieldMultiTextValue<K>
                : Type extends "multi-number"
                  ? DocSchemaFieldMultiNumberValue<K>
                  : Type extends "multi-relation"
                    ? DocSchemaFieldMultiRelationValue<K>
                    : Type extends "multi-select-text"
                      ? DocSchemaFieldMultiSelectTextValue<K>
                      : Type extends "multi-select-number"
                        ? DocSchemaFieldMultiSelectNumberValue<K>
                        : never
  : never
