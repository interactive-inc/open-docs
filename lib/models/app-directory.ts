import { z } from "zod"

// スキーマフィールド定義
const zSchemaField = z.object({
  type: z.enum([
    "string",
    "number",
    "boolean",
    "array-string",
    "array-number",
    "array-boolean",
  ]),
  required: z.boolean().optional(),
  description: z.string().optional(),
})

// ディレクトリ内のファイル情報
export const zAppDirectoryFile = z.object({
  path: z.string(),
  frontMatter: z.record(z.unknown()).nullable(),
  content: z.string(),
})

// ディレクトリAPIのレスポンス（ファイルの場合）
export const zAppDirectoryFileResponse = z.object({
  isFile: z.literal(true),
  content: z.string(),
  filePath: z.string(),
})

// ディレクトリAPIのレスポンス（ディレクトリの場合）
export const zAppDirectoryResponse = z.object({
  isFile: z.literal(false),
  schema: z.record(z.string(), zSchemaField).nullable(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  indexPath: z.string().optional(),
  files: z.array(zAppDirectoryFile),
})

// ディレクトリAPIのレスポンス（統合型）
export const zAppDirectory = z.discriminatedUnion("isFile", [
  zAppDirectoryFileResponse,
  zAppDirectoryResponse,
])
