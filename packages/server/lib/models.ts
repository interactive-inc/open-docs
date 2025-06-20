import { z } from "zod"

const zDocSchemaFieldTypeText = z.literal("text")
const zDocSchemaFieldTypeNumber = z.literal("number")
const zDocSchemaFieldTypeBoolean = z.literal("boolean")
const zDocSchemaFieldTypeMultiText = z.literal("multi-text")
const zDocSchemaFieldTypeMultiNumber = z.literal("multi-number")
const zDocSchemaFieldTypeMultiBoolean = z.literal("multi-boolean")
const zDocSchemaFieldTypeRelation = z.literal("relation")
const zDocSchemaFieldTypeMultiRelation = z.literal("multi-relation")
const zDocSchemaFieldTypeSelectText = z.literal("select-text")
const zDocSchemaFieldTypeSelectNumber = z.literal("select-number")
const zDocSchemaFieldTypeMultiSelectText = z.literal("multi-select-text")
const zDocSchemaFieldTypeMultiSelectNumber = z.literal("multi-select-number")

/**
 * スキーマフィールドで使用可能な型の定義
 */
export const zDocSchemaFieldType = z.union([
  zDocSchemaFieldTypeText,
  zDocSchemaFieldTypeNumber,
  zDocSchemaFieldTypeBoolean,
  zDocSchemaFieldTypeMultiText,
  zDocSchemaFieldTypeMultiNumber,
  zDocSchemaFieldTypeMultiBoolean,
  zDocSchemaFieldTypeRelation,
  zDocSchemaFieldTypeMultiRelation,
  zDocSchemaFieldTypeSelectText,
  zDocSchemaFieldTypeSelectNumber,
  zDocSchemaFieldTypeMultiSelectText,
  zDocSchemaFieldTypeMultiSelectNumber,
])

/**
 * 文字列フィールド
 */
export const zDocSchemaFieldText = z.object({
  type: zDocSchemaFieldTypeText,
  required: z.boolean(),
  title: z.string(),
  description: z.string(),
  default: z.string(),
})

/**
 * 数値フィールド
 */
export const zDocSchemaFieldNumber = z.object({
  type: zDocSchemaFieldTypeNumber,
  required: z.boolean(),
  title: z.string(),
  description: z.string(),
  default: z.number(),
})

/**
 * ブールフィールド
 */
export const zDocSchemaFieldBoolean = z.object({
  type: zDocSchemaFieldTypeBoolean,
  required: z.boolean(),
  title: z.string(),
  description: z.string(),
  default: z.boolean(),
})

/**
 * マルチテキストフィールド
 */
export const zDocSchemaFieldMultiText = z.object({
  type: zDocSchemaFieldTypeMultiText,
  required: z.boolean(),
  title: z.string(),
  description: z.string(),
  default: z.array(z.string()),
})

/**
 * マルチ数値フィールド
 */
export const zDocSchemaFieldMultiNumber = z.object({
  type: zDocSchemaFieldTypeMultiNumber,
  required: z.boolean(),
  title: z.string(),
  description: z.string(),
  default: z.array(z.number()),
})

/**
 * マルチブールフィールド
 */
export const zDocSchemaFieldMultiBoolean = z.object({
  type: zDocSchemaFieldTypeMultiBoolean,
  required: z.boolean(),
  title: z.string(),
  description: z.string(),
  default: z.array(z.boolean()),
})

/**
 * リレーションフィールド
 */
export const zDocSchemaFieldRelation = z.object({
  type: zDocSchemaFieldTypeRelation,
  required: z.boolean(),
  title: z.string(),
  description: z.string(),
  path: z.string(),
  default: z.string(),
})

/**
 * マルチリレーションフィールド
 */
export const zDocSchemaFieldMultiRelation = z.object({
  type: zDocSchemaFieldTypeMultiRelation,
  required: z.boolean(),
  title: z.string(),
  description: z.string(),
  path: z.string(),
  default: z.array(z.string()),
})

/**
 * 選択テキストフィールド
 */
export const zDocSchemaFieldSelectText = z.object({
  type: zDocSchemaFieldTypeSelectText,
  required: z.boolean(),
  title: z.string(),
  description: z.string(),
  options: z.array(z.string()),
  default: z.string(),
})

/**
 * 選択数値フィールド
 */
export const zDocSchemaFieldSelectNumber = z.object({
  type: zDocSchemaFieldTypeSelectNumber,
  required: z.boolean(),
  title: z.string(),
  description: z.string(),
  options: z.array(z.number()),
  default: z.number(),
})

/**
 * マルチ選択テキストフィールド
 */
export const zDocSchemaFieldMultiSelectText = z.object({
  type: zDocSchemaFieldTypeMultiSelectText,
  required: z.boolean(),
  title: z.string(),
  description: z.string(),
  options: z.array(z.string()),
  default: z.array(z.string()),
})

/**
 * マルチ選択数値フィールド
 */
export const zDocSchemaFieldMultiSelectNumber = z.object({
  type: zDocSchemaFieldTypeMultiSelectNumber,
  required: z.boolean(),
  title: z.string(),
  description: z.string(),
  options: z.array(z.number()),
  default: z.array(z.number()),
})

/**
 * スキーマフィールドのUnion型定義
 */
export const zDocSchemaField = z.union([
  zDocSchemaFieldText,
  zDocSchemaFieldNumber,
  zDocSchemaFieldBoolean,
  zDocSchemaFieldMultiText,
  zDocSchemaFieldMultiNumber,
  zDocSchemaFieldMultiBoolean,
  zDocSchemaFieldRelation,
  zDocSchemaFieldMultiRelation,
  zDocSchemaFieldSelectText,
  zDocSchemaFieldSelectNumber,
  zDocSchemaFieldMultiSelectText,
  zDocSchemaFieldMultiSelectNumber,
])

/**
 * frontMatterスキーマ
 */
export const zDocFileMdFrontMatter = z.record(
  z.string(),
  z.union([
    z.string(),
    z.boolean(),
    z.number(),
    z.array(z.string()),
    z.array(z.number()),
    z.array(z.boolean()),
    z.record(z.string(), z.unknown()),
    z.null(),
  ]),
)

/**
 * スキーマ定義
 * フィールド名とスキーマフィールドのマッピング
 */
export const zDocSchema = z.record(z.string(), zDocSchemaField)

/**
 * index.mdファイル専用のfrontMatterスキーマ
 * iconとschemaフィールドのみを持つ
 */
export const zDocFileIndexFrontMatter = z.object({
  icon: z.string(),
  schema: zDocSchema,
})

/**
 * ファイルノード
 * 再帰的なファイルツリー構造をサポート
 */
export const zDocFileNode: z.ZodSchema = z.lazy(() =>
  z.object({
    name: z.string(),
    path: z.string(),
    type: z.enum(["file", "directory"]),
    children: z.array(zDocFileNode),
    icon: z.string(),
    title: z.string(),
  }),
)

/**
 * リレーションフィールド
 */
export const zDocRelationField = z.object({
  fieldName: z.string(),
  relationPath: z.string(),
  isArray: z.boolean(),
})

/**
 * テーブルカラム
 */
export const zDocTableColumn = z.object({
  key: z.string(),
  label: z.string(),
  type: zDocSchemaFieldType,
  path: z.string(),
  options: z.union([z.array(z.string()), z.array(z.number())]),
})

/**
 * index.mdファイル
 */
export const zDocFileIndex = z.object({
  id: z.string(),
  path: z.string(),
  relativePath: z.string(),
  fileName: z.string(),
  content: z.string(),
  title: z.string(),
  description: z.string(),
  directoryName: z.string(),
  columns: z.array(zDocTableColumn),
  frontMatter: zDocFileIndexFrontMatter,
})

/**
 * リレーションオプション
 */
export const zDocRelationFile = z.object({
  value: z.string(),
  label: z.string(),
  path: z.string(),
})

/**
 * リレーショングループ
 */
export const zDocRelation = z.object({
  path: z.string(),
  files: z.array(zDocRelationFile),
})

/**
 * その他のファイル（非マークダウン）
 */
export const zDocFileUnknown = z.object({
  path: z.string(),
  fileName: z.string(),
  extension: z.string(),
  size: z.number(),
})

/**
 * マークダウンファイル（index.md以外）
 */
export const zDocFileMd = z.object({
  id: z.string(),
  path: z.string(),
  relativePath: z.string(),
  fileName: z.string(),
  content: z.string(),
  title: z.string(),
  description: z.string(),
  frontMatter: zDocFileMdFrontMatter,
})

/**
 * ファイルのunion型（index.md、通常のmd、その他）
 */
export const zDocFile = z.union([zDocFileIndex, zDocFileMd, zDocFileUnknown])

/**
 * ディレクトリ
 * ディレクトリの情報とスキーマ、ファイル一覧を含む
 */
export const zDocDirectory = z.object({
  indexFile: zDocFileIndex,
  files: z.array(zDocFileMd),
  otherFiles: z.array(zDocFileUnknown),
  markdownFilePaths: z.array(z.string()),
  cwd: z.string(),
  relations: z.array(zDocRelation),
  hasArchive: z.boolean(),
  archiveFileCount: z.number(),
  archivedFiles: z.array(zDocFileMd),
})
