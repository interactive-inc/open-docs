import { z } from "zod"

/**
 * スキーマフィールドのUnion型定義
 * 各フィールドタイプに応じた厳密な型チェックを提供
 */
export const schemaFieldSchema = z.union([
  z.object({
    type: z.literal("string"),
    required: z.boolean().default(false),
    title: z.string(),
    description: z.string().optional(),
    default: z.string().nullable().optional(),
  }),
  z.object({
    type: z.literal("number"),
    required: z.boolean().default(false),
    title: z.string(),
    description: z.string().optional(),
    default: z.number().nullable().optional(),
  }),
  z.object({
    type: z.literal("boolean"),
    required: z.boolean().default(false),
    title: z.string(),
    description: z.string().optional(),
    default: z.boolean().nullable().optional(),
  }),
  z.object({
    type: z.literal("multi-text"),
    required: z.boolean().default(false),
    title: z.string(),
    description: z.string().optional(),
    default: z.array(z.string()).nullable().optional(),
  }),
  z.object({
    type: z.literal("multi-number"),
    required: z.boolean().default(false),
    title: z.string(),
    description: z.string().optional(),
    default: z.array(z.number()).nullable().optional(),
  }),
  z.object({
    type: z.literal("multi-boolean"),
    required: z.boolean().default(false),
    title: z.string(),
    description: z.string().optional(),
    default: z.array(z.boolean()).nullable().optional(),
  }),
  z.object({
    type: z.literal("relation"),
    required: z.boolean().default(false),
    title: z.string(),
    description: z.string().optional(),
    path: z.string(),
    default: z.string().nullable().optional(),
  }),
  z.object({
    type: z.literal("multi-relation"),
    required: z.boolean().default(false),
    title: z.string(),
    description: z.string().optional(),
    path: z.string(),
    default: z.array(z.string()).nullable().optional(),
  }),
  z.object({
    type: z.literal("select-text"),
    required: z.boolean().default(false),
    title: z.string(),
    description: z.string().optional(),
    options: z.array(z.string()),
    default: z.string().nullable().optional(),
  }),
  z.object({
    type: z.literal("select-number"),
    required: z.boolean().default(false),
    title: z.string(),
    description: z.string().optional(),
    options: z.array(z.number()),
    default: z.number().nullable().optional(),
  }),
  z.object({
    type: z.literal("multi-select-text"),
    required: z.boolean().default(false),
    title: z.string(),
    description: z.string().optional(),
    options: z.array(z.string()),
    default: z.array(z.string()).nullable().optional(),
  }),
  z.object({
    type: z.literal("multi-select-number"),
    required: z.boolean().default(false),
    title: z.string(),
    description: z.string().optional(),
    options: z.array(z.number()),
    default: z.array(z.number()).nullable().optional(),
  }),
])

/**
 * スキーマフィールドで使用可能な型の定義
 */
const fieldTypeSchema = z.enum([
  "string",
  "number",
  "boolean",
  "multi-text",
  "multi-number",
  "multi-boolean",
  "relation",
  "multi-relation",
  "select-text",
  "select-number",
  "multi-select-text",
  "multi-select-number",
])

/**
 * アプリファイルのfrontMatterスキーマ
 * 様々な型の値を持つことができるレコード形式
 */
export const appFileFrontMatterSchema = z.record(
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

export type AppFileFrontMatterType = z.infer<typeof appFileFrontMatterSchema>

/**
 * アプリファイルのプロパティスキーマ
 */
export const appFilePropertiesSchema = z.object({
  frontMatter: appFileFrontMatterSchema,
})

/**
 * index.mdファイル専用のfrontMatterスキーマ
 * iconとschemaフィールドのみを持つ
 */
export const indexFrontMatterSchema = z.object({
  icon: z.string().optional(),
  schema: z.record(z.string(), z.unknown()).optional(),
})

/**
 * 一般的なMarkdownファイルのfrontMatterスキーマ
 * appFileFrontMatterSchemaと同じ定義（エイリアス）
 */
export const frontMatterSchema = appFileFrontMatterSchema

/**
 * ファイルノードの型定義
 * ファイルツリー構造で使用される再帰的な型
 */
type FileNodeType = {
  name: string
  path: string
  type: "file" | "directory"
  children?: FileNodeType[] | null
  icon?: string | null
}

/**
 * ファイルノードのスキーマ
 * 再帰的なファイルツリー構造をサポート
 */
export const fileNodeSchema: z.ZodType<FileNodeType> = z.lazy(() =>
  z.object({
    name: z.string(),
    path: z.string(),
    type: z.enum(["file", "directory"]),
    children: z.array(fileNodeSchema).nullable().optional(),
    icon: z.string().nullable().optional(),
  }),
)

/**
 * ファイルツリーのレスポンススキーマ
 */
export const fileTreeResponseSchema = z.object({
  files: z.array(fileNodeSchema),
})

/**
 * アプリファイルのスキーマ
 */
export const appFileSchema = z.object({
  path: z.string(),
  content: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  frontMatter: appFileFrontMatterSchema,
  cwd: z.string(),
})

/**
 * アプリ操作結果のスキーマ
 */
export const appResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

/**
 * テーブルカラムのスキーマ
 */
export const tableColumnSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: fieldTypeSchema,
  path: z.string().nullable().optional(),
  options: z.union([z.array(z.string()), z.array(z.number())]).optional(),
})

/**
 * index.mdファイルのスキーマ
 */
export const indexFileSchema = z.object({
  path: z.string(),
  fileName: z.string(),
  content: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  directoryName: z.string().optional(),
  columns: z.array(tableColumnSchema).optional(),
  frontMatter: indexFrontMatterSchema,
})

/**
 * 一般的なファイルのスキーマ
 */
export const fileSchema = z.object({
  path: z.string(),
  fileName: z.string(),
  content: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  frontMatter: z.record(z.string(), z.unknown()).nullable(),
})

/**
 * スキーマ定義のスキーマ
 * フィールド名とスキーマフィールドのマッピング
 */
export const schemaDefinitionSchema = z
  .record(z.string(), schemaFieldSchema)
  .nullable()

/**
 * リレーションファイルのスキーマ
 */
const relationFileSchema = z.object({
  value: z.string(),
  label: z.string(),
  path: z.string(),
})

/**
 * リレーション情報のスキーマ
 */
const relationSchema = z.object({
  path: z.string(),
  files: z.array(relationFileSchema),
})

/**
 * ディレクトリのスキーマ
 * ディレクトリの情報とスキーマ、ファイル一覧を含む
 */
export const directorySchema = z.object({
  indexFile: indexFileSchema,
  files: z.array(fileSchema),
  markdownFilePaths: z.array(z.string()),
  cwd: z.string(),
  relations: z.array(relationSchema),
})

/**
 * Markdownファイルデータのスキーマ
 */
export const markdownFileDataSchema = z.object({
  filePath: z.string(),
  frontMatter: appFileFrontMatterSchema,
  content: z.string(),
  title: z.string().nullable(),
})

/**
 * DocsEngineのプロパティスキーマ
 */
export const docsEnginePropsSchema = z.object({
  basePath: z.string(),
  indexFileName: z.string().nullable().default("index.md"),
  readmeFileName: z.string().nullable().default("README.md"),
})
