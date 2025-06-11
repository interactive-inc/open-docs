import { schemaFieldSchema, tableColumnSchema } from "@/lib/models"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import type { Schema, SchemaField } from "@/lib/types"
import type { DocFileBuilder } from "./doc-file-builder"
import { DocIndexFrontMatterBuilder } from "./doc-index-front-matter-builder"

type Props = {
  title: string | null
  description: string | null
  path: string
  content: string
  frontMatter: DocIndexFrontMatterBuilder
}

/**
 * ドキュメントのディレクトリ
 */
export class DocIndexFileBuilder {
  /**
   * ディレクトリのタイトル
   */
  readonly title: string | null

  /**
   * ディレクトリの説明
   */
  readonly description: string | null

  /**
   * ディレクトリのパス
   */
  readonly path: string

  /**
   * ディレクトリ名
   */
  get directoryName(): string {
    return this.path.split("/").pop() || this.path
  }

  /**
   * index.mdの内容
   */
  readonly content: string

  /**
   * index.mdのFrontMatter
   */
  readonly frontMatter: DocIndexFrontMatterBuilder

  constructor(props: Props) {
    this.title = props.title
    this.description = props.description
    this.path = props.path
    this.content = props.content
    this.frontMatter = props.frontMatter
  }

  /**
   * ディレクトリのスキーマ
   */
  get schema(): Schema {
    return this.frontMatter.schema
  }

  /**
   * ディレクトリのアイコン
   */
  get icon(): string | null {
    return this.frontMatter.icon
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
   * スキーマフィールドを配列として取得
   */
  getSchemaFields() {
    if (!this.schema) return []

    return Object.entries(this.schema).map(([key, field]) => {
      const fieldData = {
        key,
        type: field.type,
        required: field.required || false,
        description: field.description || key,
        relationPath: "relationPath" in field ? field.relationPath : null,
        default: field.default || null,
      }

      // schemaFieldSchemaで検証
      const validated = schemaFieldSchema.safeParse(fieldData)
      if (validated.success) {
        return { key, ...validated.data }
      }

      // 検証に失敗した場合はエラー情報をログに出力してデフォルト値を返す
      console.warn(
        `Schema field validation failed for ${key}:`,
        validated.error,
      )
      return {
        key,
        type: "string",
        required: false,
        description: key,
        relationPath: null,
        default: null,
      }
    })
  }

  /**
   * テーブルカラムを生成
   */
  getTableColumns() {
    return this.getSchemaFields().map((field) => {
      const columnData = {
        key: field.key,
        label: field.description,
        type: field.type,
        relationPath: field.relationPath,
      }

      // tableColumnSchemaで検証
      const validated = tableColumnSchema.safeParse(columnData)
      if (validated.success) {
        return validated.data
      }

      // 検証に失敗した場合はエラー情報をログに出力してデフォルト値を返す
      console.warn(
        `Table column validation failed for ${field.key}:`,
        validated.error,
      )
      return {
        key: field.key,
        label: field.key,
        type: "string",
        relationPath: null,
      }
    })
  }

  /**
   * JSON形式に変換
   */
  toJSON(): {
    schema: Schema
    title: string | null
    description: string | null
    icon: string | null
    path: string
    directoryName: string
    indexPath: string
    content: string
    frontMatter: ReturnType<DocIndexFrontMatterBuilder["toJSON"]>
    relationFields: Array<{
      fieldName: string
      relationPath: string
      isArray: boolean
    }>
  } {
    return {
      schema: this.schema,
      title: this.title,
      description: this.description,
      icon: this.icon,
      path: this.path,
      directoryName: this.directoryName,
      indexPath: this.indexPath,
      content: this.content,
      frontMatter: this.frontMatter.toJSON(),
      relationFields: this.getRelationFields(),
    }
  }

  /**
   * indexFileSchemaの形式に変換
   */
  toIndexFileSchema() {
    return {
      path: this.indexPath,
      fileName: "index.md",
      content: this.content,
      title: this.title,
      description: this.description,
      directoryName: this.directoryName,
      columns: this.getTableColumns(),
      frontMatter: {
        icon: this.icon || undefined,
        schema: this.schema || undefined,
      },
    }
  }

  /**
   * 空のDocDirectoryを作成
   */
  static empty(path: string): DocIndexFileBuilder {
    return new DocIndexFileBuilder({
      title: null,
      description: null,
      path,
      content: "",
      frontMatter: DocIndexFrontMatterBuilder.empty(),
    })
  }

  /**
   * DocFileからDocDirectoryを作成
   */
  static fromDocFile(
    path: string,
    docFile: DocFileBuilder,
  ): DocIndexFileBuilder {
    const frontMatter = DocIndexFrontMatterBuilder.fromData(
      docFile.frontMatter.data,
    )

    return new DocIndexFileBuilder({
      title: docFile.title || null,
      description: docFile.description || null,
      path,
      content: docFile.content,
      frontMatter,
    })
  }

  /**
   * Markdownファイルを解析してDocDirectoryを作成
   */
  static fromMarkdown(
    path: string,
    markdownContent: string,
  ): DocIndexFileBuilder {
    const openMarkdown = new OpenMarkdown(markdownContent)
    const frontMatter = DocIndexFrontMatterBuilder.from(markdownContent)

    return new DocIndexFileBuilder({
      title: openMarkdown.title || null,
      description: openMarkdown.description || null,
      path,
      content: markdownContent,
      frontMatter,
    })
  }
}
