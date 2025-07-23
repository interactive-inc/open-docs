import { z } from "zod"
import { zDocSchemaFieldMinimal } from "../models"

/**
 * 動的にZodスキーマを生成するビルダー
 */
export class DocSchemaBuilder {
  /**
   * 動的にZodスキーマを生成
   */
  createDynamicSchema(value: unknown): z.ZodTypeAny {
    if (typeof value !== "object" || value === null) {
      throw new Error("Schema must be an object")
    }

    const schemaObj = value as Record<string, unknown>
    const zodFields: Record<string, z.ZodTypeAny> = {}

    for (const [key, field] of Object.entries(schemaObj)) {
      if (typeof field !== "object" || field === null) {
        throw new Error(`Field "${key}" must be an object`)
      }

      const fieldObj = field as Record<string, unknown>

      // typeとrequiredは必須
      if (!("type" in fieldObj) || !("required" in fieldObj)) {
        throw new Error(
          `Field "${key}" must have "type" and "required" properties`,
        )
      }

      // 最小限の検証を行う
      try {
        zDocSchemaFieldMinimal.parse(fieldObj)
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Field "${key}": ${error.message}`)
        }
        throw error
      }

      // フィールドタイプに応じた完全なスキーマを構築
      zodFields[key] = this.createFieldSchema(fieldObj.type as string)
    }

    return z.object(zodFields)
  }

  /**
   * フィールドタイプに応じたZodスキーマを生成
   */
  private createFieldSchema(type: string): z.ZodTypeAny {
    const baseSchema = {
      type: z.literal(type),
      required: z.boolean(),
      title: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
    }

    if (type === "text") {
      return z.object({
        ...baseSchema,
        default: z.string().nullable().default(""),
      })
    }
    if (type === "number") {
      return z.object({
        ...baseSchema,
        default: z.number().nullable().default(0),
      })
    }
    if (type === "boolean") {
      return z.object({
        ...baseSchema,
        default: z.boolean().nullable().default(false),
      })
    }
    if (type === "multi-text") {
      return z.object({
        ...baseSchema,
        default: z.array(z.string()).default([]),
      })
    }
    if (type === "multi-number") {
      return z.object({
        ...baseSchema,
        default: z.array(z.number()).default([]),
      })
    }
    if (type === "multi-boolean") {
      return z.object({
        ...baseSchema,
        default: z.array(z.boolean()).default([]),
      })
    }
    if (type === "relation") {
      return z.object({
        ...baseSchema,
        path: z.string().min(1),
        default: z.string().nullable().default(null),
      })
    }
    if (type === "multi-relation") {
      return z.object({
        ...baseSchema,
        path: z.string().min(1),
        default: z.array(z.string()).nullable().default(null),
      })
    }
    if (type === "select-text") {
      return z.object({
        ...baseSchema,
        options: z.array(z.string()),
        default: z.string().nullable().default(null),
      })
    }
    if (type === "select-number") {
      return z.object({
        ...baseSchema,
        options: z.array(z.number()),
        default: z.number().nullable().default(null),
      })
    }
    if (type === "multi-select-text") {
      return z.object({
        ...baseSchema,
        options: z.array(z.string()),
        default: z.array(z.string()).nullable().default(null),
      })
    }
    if (type === "multi-select-number") {
      return z.object({
        ...baseSchema,
        options: z.array(z.number()),
        default: z.array(z.number()).nullable().default(null),
      })
    }
    
    throw new Error(`Unknown field type: ${type}`)
  }
}