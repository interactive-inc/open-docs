export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "array-string"
  | "array-number"
  | "array-boolean"
  | "relation"
  | "array-relation"

export type SchemaField = {
  type: FieldType
  required?: boolean
  description?: string
  relationPath?: string
  default?: unknown
}

export type Schema = Record<string, SchemaField>
