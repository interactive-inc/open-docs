import type { z } from "zod/v4"
import type {
  zDocFile,
  zDocFileContentIndex,
  zDocFileContentMd,
  zDocFileIndex,
  zDocFileIndexFrontMatter,
  zDocFileMd,
  zDocFileMdFrontMatter,
  zDocFilePath,
  zDocFileUnknown,
  zDocRelation,
  zDocRelationField,
  zDocRelationFile,
  zDocSchema,
  zDocSchemaField,
  zDocSchemaFieldBoolean,
  zDocSchemaFieldMultiBoolean,
  zDocSchemaFieldMultiNumber,
  zDocSchemaFieldMultiRelation,
  zDocSchemaFieldMultiSelectNumber,
  zDocSchemaFieldMultiSelectText,
  zDocSchemaFieldMultiText,
  zDocSchemaFieldNumber,
  zDocSchemaFieldRelation,
  zDocSchemaFieldSelectNumber,
  zDocSchemaFieldSelectText,
  zDocSchemaFieldText,
  zDocSchemaFieldType,
} from "./models"

/**
 * スキーマフィールドで使用可能な型
 */
export type FieldType =
  | "text"
  | "number"
  | "boolean"
  | "multi-text"
  | "multi-number"
  | "multi-boolean"
  | "relation"
  | "multi-relation"
  | "select-text"
  | "select-number"
  | "multi-select-text"
  | "multi-select-number"

/**
 * 文字列フィールドの型
 */
export type DocSchemaFieldText = z.infer<typeof zDocSchemaFieldText>

/**
 * 数値フィールドの型
 */
export type DocSchemaFieldNumber = z.infer<typeof zDocSchemaFieldNumber>

/**
 * ブールフィールドの型
 */
export type DocSchemaFieldBoolean = z.infer<typeof zDocSchemaFieldBoolean>

/**
 * マルチテキストフィールドの型
 */
export type DocFieldMultiText = z.infer<typeof zDocSchemaFieldMultiText>

/**
 * マルチ数値フィールドの型
 */
export type DocFieldMultiNumber = z.infer<typeof zDocSchemaFieldMultiNumber>

/**
 * マルチブールフィールドの型
 */
export type DocFieldMultiBoolean = z.infer<typeof zDocSchemaFieldMultiBoolean>

/**
 * リレーションフィールドの型
 */
export type DocSchemaFieldRelation = z.infer<typeof zDocSchemaFieldRelation>

/**
 * マルチリレーションフィールドの型
 */
export type DocFieldMultiRelation = z.infer<typeof zDocSchemaFieldMultiRelation>

/**
 * 選択テキストフィールドの型
 */
export type DocSchemaFieldSelectText = z.infer<typeof zDocSchemaFieldSelectText>

/**
 * 選択数値フィールドの型
 */
export type DocSchemaFieldSelectNumber = z.infer<
  typeof zDocSchemaFieldSelectNumber
>

/**
 * マルチ選択テキストフィールドの型
 */
export type DocSchemaFieldMultiSelectText = z.infer<
  typeof zDocSchemaFieldMultiSelectText
>

/**
 * マルチ選択数値フィールドの型
 */
export type DocSchemaFieldMultiSelectNumber = z.infer<
  typeof zDocSchemaFieldMultiSelectNumber
>

export type DocFileMdFrontMatter = z.infer<typeof zDocFileMdFrontMatter>

/**
 * スキーマフィールドタイプの型
 */
export type DocSchemaFieldType = z.infer<typeof zDocSchemaFieldType>

/**
 * スキーマフィールドの型
 */
export type DocSchemaField = z.infer<typeof zDocSchemaField>

/**
 * スキーマ定義の型
 */
export type DocSchemaRecord = z.infer<typeof zDocSchema>

/**
 * リレーション型フィールドのUnion型
 */
export type RelationFieldTypes = DocSchemaFieldRelation | DocFieldMultiRelation

/**
 * ファイルノードの型（ファイル専用）
 */
export type DocTreeFileNode = {
  type: "file"
  name: string
  path: string
  icon: string
  title: string
}

/**
 * ディレクトリノードの型（ディレクトリ専用）
 */
export type DocTreeDirectoryNode = {
  type: "directory"
  name: string
  path: string
  icon: string
  title: string
  children: DocTreeNode[]
}

/**
 * ツリーノードの統合型
 */
export type DocTreeNode = DocTreeFileNode | DocTreeDirectoryNode

/**
 * 後方互換性のためのエイリアス
 */
export type DocFileNode = DocTreeNode

/**
 * インデックスファイルの型
 */
export type DocFileIndex = z.infer<typeof zDocFileIndex>

/**
 * マークダウンファイル（index.md以外）の型
 */
export type DocFileMd = z.infer<typeof zDocFileMd>

/**
 * その他のファイル（非マークダウン）の型
 */
export type DocFileUnknown = z.infer<typeof zDocFileUnknown>

/**
 * ファイルのunion型（index.md、通常のmd、その他）
 */
export type DocFile = z.infer<typeof zDocFile>

/**
 * ディレクトリFrontMatterの型
 */
export type DocFileIndexFrontMatter = z.infer<typeof zDocFileIndexFrontMatter>

/**
 * リレーションオプションの型
 */
export type DocRelationFile = z.infer<typeof zDocRelationFile>

/**
 * リレーション情報の型
 */
export type DocRelation = z.infer<typeof zDocRelation>

/**
 * リレーションフィールドの型
 */
export type DocRelationField = z.infer<typeof zDocRelationField>

/**
 * ファイルパス情報の型
 */
export type DocFilePath = z.infer<typeof zDocFilePath>

/**
 * Markdownコンテンツ情報の型
 */
export type DocFileContentMd = z.infer<typeof zDocFileContentMd>

/**
 * Indexファイルコンテンツ情報の型
 */
export type DocFileContentIndex = z.infer<typeof zDocFileContentIndex>

/**
 * ディレクトリレスポンスの型（serverパッケージの型を再エクスポート）
 */
export type DocDirectory = {
  cwd: string
  indexFile: DocFileIndex
  files: DocFile[]
  relations: DocRelation[]
}
