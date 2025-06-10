import { z } from "zod"
import type { SchemaDefinition } from "./docs-engine/types"

export function createZodSchemaFromDefinition(schemaDef: SchemaDefinition) {
  const zodSchema: Record<string, z.ZodTypeAny> = {}

  for (const [fieldName, fieldDef] of Object.entries(schemaDef)) {
    let fieldSchema: z.ZodTypeAny

    switch (fieldDef.type) {
      case "string":
        fieldSchema = z.string()
        break
      case "number":
        fieldSchema = z.number()
        break
      case "boolean":
        fieldSchema = z.boolean()
        break
      case "array-string":
        fieldSchema = z.array(z.string())
        break
      case "array-number":
        fieldSchema = z.array(z.number())
        break
      case "array-boolean":
        fieldSchema = z.array(z.boolean())
        break
      case "relation":
        fieldSchema = z.string().nullable()
        break
      case "array-relation":
        fieldSchema = z.array(z.string())
        break
      default:
        throw new Error(`Unknown field type: ${fieldDef.type}`)
    }

    // requiredフィールドの処理
    if (fieldDef.required === false) {
      fieldSchema = fieldSchema.optional()
    }

    zodSchema[fieldName] = fieldSchema
  }

  return z.object(zodSchema)
}

export function validateWithSchema(
  data: unknown,
  schemaDef: SchemaDefinition,
): { success: boolean; data?: unknown; error?: z.ZodError } {
  try {
    const zodSchema = createZodSchemaFromDefinition(schemaDef)
    const result = zodSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error }
    }
    throw error
  }
}
