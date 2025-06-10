export type SchemaFieldType =
  | "string"
  | "number"
  | "boolean"
  | "array-string"
  | "array-number"
  | "array-boolean"
  | "relation"
  | "array-relation"

export type SchemaField = {
  type: SchemaFieldType
  required?: boolean
  description?: string
  default?: unknown
  relationPath?: string
}

export type SchemaDefinition = {
  [key: string]: SchemaField
}
