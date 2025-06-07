import { z } from "zod"

const schemaFieldSchema = z.object({
  type: z.enum([
    "string",
    "number",
    "boolean",
    "array",
    "array-string",
    "array-number",
    "array-boolean",
  ]),
  required: z.boolean().optional(),
  description: z.string().optional(),
})

export const directoryFrontMatterSchema = z.object({
  icon: z.string().optional(),
  title: z.string().optional(),
  schema: z.record(z.string(), schemaFieldSchema).optional(),
})

export type DirectoryFrontMatter = z.infer<typeof directoryFrontMatterSchema>
