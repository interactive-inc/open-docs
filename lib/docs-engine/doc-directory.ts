import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import type { SchemaField } from "@/lib/docs-engine/types"
// import { directoryFrontMatterSchema } from "@/lib/validations/directory-front-matter-schema"
import type { Schema } from "@/lib/docs-engine/models/doc-schema"
// import { DocDirectoryFrontMatter } from "./doc-directory-front-matter"
import type { DocFile } from "./doc-file"

type Props = {
  schema: Schema
  title: string | null
  description: string | null
  icon: string | null
  path: string
}

/**
 * ドキュメントのディレクトリ
 */
export class DocDirectory {
  /**
   * ディレクトリのスキーマ
   */
  readonly schema: Schema

  /**
   * ディレクトリのタイトル
   */
  readonly title: string | null

  /**
   * ディレクトリの説明
   */
  readonly description: string | null

  /**
   * ディレクトリのアイコン
   */
  readonly icon: string | null

  /**
   * ディレクトリのパス
   */
  readonly path: string

  constructor(props: Props) {
    this.schema = props.schema
    this.title = props.title
    this.description = props.description
    this.icon = props.icon
    this.path = props.path
  }

  /**
   * インデックスファイルのパス
   */
  get indexPath(): string {
    return `${this.path}/index.md`
  }

  /**
   * デフォルトのindex.mdコンテンツを生成
   */
  static generateDefaultIndexContent(path: string): string {
    const dirName = path.split("/").pop() || "directory"
    return `---\ntitle: \"${dirName}\"\ndescription: \"\"\nicon: \"\"\nschema: {}\n---\n\n# ${dirName}\n`
  }

  /**
   * スキーマからリレーションフィールドを取得
   */
  getRelationFields(): Array<{
    fieldName: string
    relationPath: string
    isArray: boolean
  }> {
    const relationFields: Array<{
      fieldName: string
      relationPath: string
      isArray: boolean
    }> = []

    for (const [fieldName, field] of Object.entries(this.schema)) {
      const fieldDef = field as SchemaField
      if (
        (fieldDef.type === "relation" || fieldDef.type === "array-relation") &&
        fieldDef.relationPath
      ) {
        relationFields.push({
          fieldName,
          relationPath: fieldDef.relationPath,
          isArray: fieldDef.type === "array-relation",
        })
      }
    }

    return relationFields
  }

  /**
   * スキーマをAPI用に変換
   */
  convertSchemaForApi() {
    if (!this.schema) return null

    const converted: Record<
      string,
      {
        type: string
        required?: boolean
        description?: string
        relationPath?: string
        default?: unknown
      }
    > = {}

    for (const [key, field] of Object.entries(this.schema)) {
      let type = field.type
      if (type === "array") {
        type = "array-string" // デフォルト変換
      }

      converted[key] = {
        type,
        required: field.required,
        description: field.description,
        relationPath: field.relationPath,
        default: field.default,
      }
    }
    return converted
  }

  /**
   * JSON形式に変換
   */
  toJSON(): {
    isFile: false
    schema: Schema
    title: string | null
    description: string | null
    icon: string | null
    path: string
    indexPath: string
    relationFields: Array<{
      fieldName: string
      relationPath: string
      isArray: boolean
    }>
  } {
    return {
      isFile: false,
      schema: this.schema,
      title: this.title,
      description: this.description,
      icon: this.icon,
      path: this.path,
      indexPath: this.indexPath,
      relationFields: this.getRelationFields(),
    }
  }

  /**
   * 空のDocDirectoryを作成
   */
  static empty(path: string): DocDirectory {
    return new DocDirectory({
      schema: {},
      title: null,
      description: null,
      icon: null,
      path,
    })
  }

  /**
   * DocFileからDocDirectoryを作成
   */
  static fromDocFile(
    path: string,
    docFile: DocFile<Record<string, unknown>>,
  ): DocDirectory {
    const rawData = docFile.frontMatter.data as Record<string, unknown>
    const schema = (rawData?.schema as Schema) || {}

    return new DocDirectory({
      schema,
      title: docFile.title || (rawData?.title as string) || null,
      description: null,
      icon: (rawData?.icon as string) || null,
      path,
    })
  }

  /**
   * Markdownファイルを解析してDocDirectoryを作成
   */
  static fromMarkdown(path: string, markdownContent: string): DocDirectory {
    const openMarkdown = new OpenMarkdown(markdownContent)
    const rawData = openMarkdown.frontMatter.data || {}
    const schema = (rawData?.schema as Schema) || {}

    return new DocDirectory({
      schema,
      title: openMarkdown.title || (rawData?.title as string) || null,
      description: (rawData?.description as string) || null,
      icon: (rawData?.icon as string) || null,
      path,
    })
  }
}
