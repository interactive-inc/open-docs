type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "array-string"
  | "array-number"
  | "array-boolean"

type SchemaField = {
  type: FieldType
  required?: boolean
  description?: string
}

type Schema = Record<string, SchemaField>

export type { Schema, SchemaField, FieldType }
