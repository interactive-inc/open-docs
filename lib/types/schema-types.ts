export type SchemaFieldType =
  | "string"
  | "number"
  | "boolean"
  | "array-string"
  | "array-number"
  | "array-boolean"

export type SchemaField = {
  type: SchemaFieldType
  required?: boolean
  description?: string
}

export type SchemaDefinition = {
  [key: string]: SchemaField
}
