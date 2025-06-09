import { z } from "zod"

/**
 * テーブルカラムのスキーマ
 */
export const zTableColumn = z.object({
  key: z.string(),
  label: z.string(),
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
  relationPath: z.string().optional(),
})
