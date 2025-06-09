import { z } from "zod"
import { zDirectoryFile } from "./directory-file-schema"
import { zSchemaDefinition } from "./schema-definition-schema"
import { zTableColumn } from "./table-column-schema"

const zRelationFile = z.object({
  value: z.string(),
  label: z.string(),
  path: z.string(),
})

const zRelationInfo = z.object({
  path: z.string(),
  files: z.array(zRelationFile),
})

/**
 * ディレクトリレスポンスのスキーマ
 */
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
