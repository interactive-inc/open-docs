/**
 * ディレクトリファイルの型
 */
export type DirectoryFile = {
  path: string
  fileName: string
  frontMatter: Record<string, unknown> | null
  content: string
  title: string | null
  description: string | null
}

/**
 * スキーマフィールドの型
 */
export type SchemaField = {
  type:
    | "string"
    | "number"
    | "boolean"
    | "array-string"
    | "array-number"
    | "array-boolean"
    | "relation"
    | "array-relation"
  required: boolean
  description: string
  relationPath?: string
  default?: unknown
}

/**
 * スキーマ定義の型
 */
export type SchemaDefinition = Record<string, SchemaField> | null

/**
 * テーブルカラムの型
 */
export type TableColumn = {
  key: string
  label: string
  type:
    | "string"
    | "number"
    | "boolean"
    | "array-string"
    | "array-number"
    | "array-boolean"
    | "relation"
    | "array-relation"
  relationPath?: string
}

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

/**
 * ディレクトリレスポンスの型
 */
export type DirectoryResponse = {
  isFile: false
  schema: SchemaDefinition
  columns: TableColumn[]
  title: string
  description: string | null
  indexPath: string | null
  files: DirectoryFile[]
  directoryName: string
  markdownFilePaths: string[]
  cwd: string
  relations: RelationInfo[]
}
