export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "array-string"
  | "array-number"
  | "array-boolean"

export type SchemaField = {
  type: FieldType
  required?: boolean
  description?: string
}

export type Schema = Record<string, SchemaField>
