import type { FileNode, FileTreeResponse } from "@/system/types"
import { z } from "zod"

const zFieldType = z.enum([
  "string",
  "number",
  "boolean",
  "array-string",
  "array-number",
  "array-boolean",
  "relation",
  "array-relation",
])

export const zAppFileFrontMatter = z.record(
  z.string(),
  z.union([
    z.string(),
    z.boolean(),
    z.number(),
    z.array(z.string()),
    z.array(z.number()),
    z.array(z.boolean()),
    z.null(),
  ]),
)

export type AppFileFrontMatter = z.infer<typeof zAppFileFrontMatter>

export const zAppFileProperties = z.object({
  frontMatter: zAppFileFrontMatter,
})

export const zFileNode: z.ZodType<FileNode> = z.lazy(() =>
  z.object({
    name: z.string(),
    path: z.string(),
    type: z.enum(["file", "directory"]),
    children: z.array(zFileNode).optional(),
    icon: z.string().optional(),
  }),
)

export const zFileTreeResponse = z.object({
  files: z.array(zFileNode),
}) satisfies z.ZodType<FileTreeResponse>

export const zAppFile = z.object({
  path: z.string(),
  content: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  frontMatter: z.record(z.unknown()),
  cwd: z.string(),
})

export const zAppResult = z.object({
  success: z.boolean(),
  message: z.string(),
})

export const zDirectoryFile = z.object({
  path: z.string(),
  fileName: z.string(),
  content: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  frontMatter: z.record(z.string(), z.unknown()).nullable(),
})

export const zSchemaField = z.object({
  type: zFieldType,
  required: z.boolean().default(false),
  description: z.string(),
  relationPath: z.string().optional(),
  default: z.unknown().optional(),
})

export const zSchemaDefinition = z.record(z.string(), zSchemaField).nullable()

export const zTableColumn = z.object({
  key: z.string(),
  label: z.string(),
  type: zFieldType,
  relationPath: z.string().optional(),
})

const zRelationFile = z.object({
  value: z.string(),
  label: z.string(),
  path: z.string(),
})

const zRelationInfo = z.object({
  path: z.string(),
  files: z.array(zRelationFile),
})

export const zDirectoryResponse = z.object({
  isFile: z.literal(false),
  schema: zSchemaDefinition,
  columns: z.array(zTableColumn),
  title: z.string(),
  description: z.string().nullable(),
  icon: z.string(),
  indexPath: z.string().nullable(),
  files: z.array(zDirectoryFile),
  directoryName: z.string(),
  markdownFilePaths: z.array(z.string()),
  cwd: z.string(),
  relations: z.array(zRelationInfo),
})
