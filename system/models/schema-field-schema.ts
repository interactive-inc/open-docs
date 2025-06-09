import { z } from "zod"

/**
 * スキーマフィールドのスキーマ
 */
export const zSchemaField = z.object({
  type: z.enum([
    "string",
    "number",
    "boolean",
    "array-string",
    "array-number",
    "array-boolean",
    "relation",
    "array-relation",
  ]),
  required: z.boolean().default(false),
  description: z.string(),
  relationPath: z.string().optional(),
  default: z.unknown().optional(),
})
