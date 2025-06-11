import type { z } from "zod"
import type {
  appFileFrontMatterSchema,
  appFileSchema,
  appResultSchema,
  directorySchema,
  docsEnginePropsSchema,
  fileNodeSchema,
  fileSchema,
  fileTreeResponseSchema,
  indexFrontMatterSchema,
  markdownFileDataSchema,
  schemaDefinitionSchema,
  schemaFieldSchema,
  tableColumnSchema,
} from "./models"

/**
 * スキーマフィールドで使用可能な型
 */
export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "array-string"
  | "array-number"
  | "array-boolean"
  | "relation"
  | "array-relation"

/**
 * スキーマフィールドの型
 */
export type SchemaField = z.infer<typeof schemaFieldSchema>

/**
 * スキーマ定義の型
 */
export type Schema = Record<string, SchemaField>

/**
 * スキーマ定義（null許可）の型
 */
export type SchemaDefinition = z.infer<typeof schemaDefinitionSchema>

/**
 * テーブルカラムの型
 */
export type TableColumn = z.infer<typeof tableColumnSchema>

/**
 * ファイルノードの型（ファイルツリー用）
 */
export type FileNode = z.infer<typeof fileNodeSchema>

/**
 * ファイルツリーレスポンスの型
 */
export type FileTreeResponse = z.infer<typeof fileTreeResponseSchema>

/**
 * ディレクトリレスポンスの型
 */
export type DirectoryResponse = z.infer<typeof directorySchema>

/**
 * アプリファイルの型
 */
export type AppFile = z.infer<typeof appFileSchema>

/**
 * アプリ結果の型
 */
export type AppResult = z.infer<typeof appResultSchema>

/**
 * アプリファイルのfrontMatterの型
 */
export type AppFileFrontMatter = z.infer<typeof appFileFrontMatterSchema>

/**
 * ディレクトリファイルの型
 */
export type DirectoryFile = z.infer<typeof fileSchema>

/**
 * ディレクトリFrontMatterの型
 */
export type DirectoryFrontMatter = z.infer<typeof indexFrontMatterSchema>

/**
 * Markdownファイルデータの型
 */
export type MarkdownFileData = z.infer<typeof markdownFileDataSchema>

/**
 * DocsEngineのプロパティの型
 */
export type DocsEngineProps = z.infer<typeof docsEnginePropsSchema>

/**
 * リレーションオプションの型
 */
export type RelationOption = {
  value: string
  label: string
  path: string
}

/**
 * リレーション情報の型
 */
export type RelationInfo = {
  path: string
  files: RelationOption[]
}
