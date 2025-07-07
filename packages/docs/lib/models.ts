import { z } from "zod/v4"

/**
 * ファイルパス情報
 */
export const zDocFilePath = z.object({
  name: z.string(),
  path: z.string(),
  fullPath: z.string(),
  nameWithExtension: z.string(),
})

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
  title: z.string().nullable(),
  description: z.string().nullable(),
  default: z.string().nullable(),
})

/**
 * 数値フィールド
 */
export const zDocSchemaFieldNumber = z.object({
  type: zDocSchemaFieldTypeNumber,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  default: z.number().nullable(),
})

/**
 * ブールフィールド
 */
export const zDocSchemaFieldBoolean = z.object({
  type: zDocSchemaFieldTypeBoolean,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  default: z.boolean().nullable(),
})

/**
 * マルチテキストフィールド
 */
export const zDocSchemaFieldMultiText = z.object({
  type: zDocSchemaFieldTypeMultiText,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  default: z.array(z.string()).nullable(),
})

/**
 * マルチ数値フィールド
 */
export const zDocSchemaFieldMultiNumber = z.object({
  type: zDocSchemaFieldTypeMultiNumber,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  default: z.array(z.number()).nullable(),
})

/**
 * マルチブールフィールド
 */
export const zDocSchemaFieldMultiBoolean = z.object({
  type: zDocSchemaFieldTypeMultiBoolean,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  default: z.array(z.boolean()).nullable(),
})

/**
 * リレーションフィールド
 */
export const zDocSchemaFieldRelation = z.object({
  type: zDocSchemaFieldTypeRelation,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  path: z.string().min(1),
  default: z.string().nullable(),
})

/**
 * マルチリレーションフィールド
 */
export const zDocSchemaFieldMultiRelation = z.object({
  type: zDocSchemaFieldTypeMultiRelation,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  path: z.string().min(1),
  default: z.array(z.string()).nullable(),
})

/**
 * 選択テキストフィールド
 */
export const zDocSchemaFieldSelectText = z.object({
  type: zDocSchemaFieldTypeSelectText,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  options: z.array(z.string()),
  default: z.string().nullable(),
})

/**
 * 選択数値フィールド
 */
export const zDocSchemaFieldSelectNumber = z.object({
  type: zDocSchemaFieldTypeSelectNumber,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  options: z.array(z.number()),
  default: z.number().nullable(),
})

/**
 * マルチ選択テキストフィールド
 */
export const zDocSchemaFieldMultiSelectText = z.object({
  type: zDocSchemaFieldTypeMultiSelectText,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  options: z.array(z.string()),
  default: z.array(z.string()).nullable(),
})

/**
 * マルチ選択数値フィールド
 */
export const zDocSchemaFieldMultiSelectNumber = z.object({
  type: zDocSchemaFieldTypeMultiSelectNumber,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  options: z.array(z.number()),
  default: z.array(z.number()).nullable(),
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
  type: z.literal("index-frontmatter"),
  icon: z.string(),
  schema: zDocSchema,
})

/**
 * リレーションフィールド
 */
export const zDocRelationField = z.object({
  fieldName: z.string(),
  filePath: z.string(),
  isArray: z.boolean(),
})

/**
 * リレーションオプション
 */
export const zDocRelationFile = z.object({
  name: z.string(),
  label: z.string().nullable(),
  value: z.string().nullable(),
  path: z.string().nullable(),
})

/**
 * リレーショングループ
 */
export const zDocRelation = z.object({
  path: z.string(),
  files: z.array(zDocRelationFile),
})

/**
 * Markdownコンテンツ情報（通常のMDファイル用）
 */
export const zDocFileContentMd = z.object({
  type: z.literal("markdown-content"),
  body: z.string(),
  title: z.string(),
  description: z.string(),
  frontMatter: zDocFileMdFrontMatter,
})

/**
 * Markdownコンテンツ情報（indexファイル用）
 */
export const zDocFileContentIndex = z.object({
  type: z.literal("markdown-index"),
  body: z.string(),
  title: z.string(),
  description: z.string(),
  frontMatter: zDocFileIndexFrontMatter,
})

/**
 * index.mdファイル
 */
export const zDocFileIndex = z.object({
  type: z.literal("index"),
  path: zDocFilePath,
  content: zDocFileContentIndex,
  isArchived: z.boolean(),
})

/**
 * その他のファイル（非マークダウン）
 */
export const zDocFileUnknown = z.object({
  type: z.literal("unknown"),
  path: zDocFilePath,
  content: z.string(),
  extension: z.string(),
  isArchived: z.boolean(),
})

/**
 * マークダウンファイル（index.md以外）
 */
export const zDocFileMd = z.object({
  type: z.literal("markdown"),
  path: zDocFilePath,
  content: zDocFileContentMd,
  isArchived: z.boolean(),
})

/**
 * ファイルのunion型（index.md、通常のmd、その他）
 */
export const zDocFile = z.union([zDocFileIndex, zDocFileMd, zDocFileUnknown])

/**
 * ファイルノード（ファイル専用）
 */
export const zDocTreeFileNode = z.object({
  type: z.literal("file"),
  name: z.string(),
  path: z.string(),
  icon: z.string(),
  title: z.string(),
})

/**
 * ディレクトリノード（ディレクトリ専用）
 */
export const zDocTreeDirectoryNode: z.ZodSchema = z.lazy(() => {
  return z.object({
    type: z.literal("directory"),
    name: z.string(),
    path: z.string(),
    icon: z.string(),
    title: z.string(),
    children: z.array(z.union([zDocTreeFileNode, zDocTreeDirectoryNode])),
  })
})

/**
 * ツリーノードの統合型
 */
export const zDocTreeNode = z.union([zDocTreeFileNode, zDocTreeDirectoryNode])
