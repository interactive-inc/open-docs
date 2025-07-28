import type { DocMetaFieldType, RecordKey } from "@/types"
import { DocSchemaFieldBooleanValue } from "@/values/doc-schema-field/doc-schema-field-boolean-value"
import { DocSchemaFieldMultiNumberValue } from "@/values/doc-schema-field/doc-schema-field-multi-number-value"
import { DocSchemaFieldMultiRelationValue } from "@/values/doc-schema-field/doc-schema-field-multi-relation-value"
import { DocSchemaFieldMultiSelectNumberValue } from "@/values/doc-schema-field/doc-schema-field-multi-select-number-value"
import { DocSchemaFieldMultiSelectTextValue } from "@/values/doc-schema-field/doc-schema-field-multi-select-text-value"
import { DocSchemaFieldMultiTextValue } from "@/values/doc-schema-field/doc-schema-field-multi-text-value"
import { DocSchemaFieldNumberValue } from "@/values/doc-schema-field/doc-schema-field-number-value"
import { DocSchemaFieldRelationValue } from "@/values/doc-schema-field/doc-schema-field-relation-value"
import { DocSchemaFieldSelectNumberValue } from "@/values/doc-schema-field/doc-schema-field-select-number-value"
import { DocSchemaFieldSelectTextValue } from "@/values/doc-schema-field/doc-schema-field-select-text-value"
import { DocSchemaFieldTextValue } from "@/values/doc-schema-field/doc-schema-field-text-value"

export class DocFileIndexSchemaFieldFactory {
  empty(key: RecordKey, type: DocMetaFieldType) {
    if (type === "text") {
      return DocSchemaFieldTextValue.empty(key)
    }

    if (type === "number") {
      return DocSchemaFieldNumberValue.empty(key)
    }

    if (type === "boolean") {
      return DocSchemaFieldBooleanValue.empty(key)
    }

    if (type === "select-text") {
      return DocSchemaFieldSelectTextValue.empty(key)
    }

    if (type === "select-number") {
      return DocSchemaFieldSelectNumberValue.empty(key)
    }

    if (type === "relation") {
      return DocSchemaFieldRelationValue.empty(key)
    }

    if (type === "multi-text") {
      return DocSchemaFieldMultiTextValue.empty(key)
    }

    if (type === "multi-number") {
      return DocSchemaFieldMultiNumberValue.empty(key)
    }

    if (type === "multi-select-text") {
      return DocSchemaFieldMultiSelectTextValue.empty(key)
    }

    if (type === "multi-select-number") {
      return DocSchemaFieldMultiSelectNumberValue.empty(key)
    }

    if (type === "multi-relation") {
      return DocSchemaFieldMultiRelationValue.empty(key)
    }

    throw new Error(`Unknown field type: ${type}`)
  }

  normalize(key: RecordKey, record: Record<RecordKey, unknown>) {
    const value = record as { type: DocMetaFieldType }
    const type = value.type

    if (type === "text") {
      return DocSchemaFieldTextValue.normalize(key, record)
    }

    if (type === "number") {
      return DocSchemaFieldNumberValue.normalize(key, record)
    }

    if (type === "boolean") {
      return DocSchemaFieldBooleanValue.normalize(key, record)
    }

    if (type === "select-text") {
      return DocSchemaFieldSelectTextValue.normalize(key, record)
    }

    if (type === "select-number") {
      return DocSchemaFieldSelectNumberValue.normalize(key, record)
    }

    if (type === "relation") {
      return DocSchemaFieldRelationValue.normalize(key, record)
    }

    if (type === "multi-text") {
      return DocSchemaFieldMultiTextValue.normalize(key, record)
    }

    if (type === "multi-number") {
      return DocSchemaFieldMultiNumberValue.normalize(key, record)
    }

    if (type === "multi-select-text") {
      return DocSchemaFieldMultiSelectTextValue.normalize(key, record)
    }

    if (type === "multi-select-number") {
      return DocSchemaFieldMultiSelectNumberValue.normalize(key, record)
    }

    if (type === "multi-relation") {
      return DocSchemaFieldMultiRelationValue.normalize(key, record)
    }

    throw new Error(`Unknown field type: ${type}`)
  }
}
