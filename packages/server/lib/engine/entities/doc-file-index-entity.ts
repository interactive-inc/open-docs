import type { DocFileMdEntity } from "@/lib/engine/entities/doc-file-md-entity"
import { DocFrontMatterIndexValue } from "@/lib/engine/values/doc-front-matter-index-value"
import { DocRelationFieldValue } from "@/lib/engine/values/doc-relation-field-value"
import { DocSchemaFieldValue } from "@/lib/engine/values/doc-schema-field-value"
import { zDocFileIndex, zDocFileIndexFrontMatter } from "@/lib/models"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import type { DocFileIndex, DocSchemaRecord } from "@/lib/types"

/**
 * ドキュメントのディレクトリ
 */
export class DocFileIndexEntity {
  constructor(readonly value: DocFileIndex) {
    zDocFileIndex.parse(value)
    Object.freeze(this)
  }

  /**
   * ディレクトリのタイトル
   */
  get title(): string | null {
    return this.value.title
  }

  /**
   * ディレクトリの説明
   */
  get description(): string | null {
    return this.value.description
  }

  /**
   * ディレクトリのパス
   */
  get path(): string {
    return this.value.path
  }

  /**
   * ディレクトリ名
   */
  get directoryName(): string {
    return this.path.split("/").pop() || this.path
  }

  /**
   * ファイル名
   */
  get fileName(): string {
    return this.value.fileName
  }

  /**
   * index.mdの内容
   */
  get content(): string {
    return this.value.content
  }

  /**
   * index.mdのFrontMatter
   */
  get frontMatter(): DocFrontMatterIndexValue {
    const frontMatterData = this.value.frontMatter || { icon: null, schema: {} }

    // zDocIndexFileFrontMatter形式に変換
    if ("icon" in frontMatterData && "schema" in frontMatterData) {
      return new DocFrontMatterIndexValue(
        zDocFileIndexFrontMatter.parse(frontMatterData),
      )
    }

    // Record<string, unknown>形式の場合は変換
    return DocFrontMatterIndexValue.fromData(frontMatterData)
  }

  /**
   * ディレクトリのスキーマ
   */
  get schema(): DocSchemaRecord {
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
  getRelationFields(): DocRelationFieldValue[] {
    const relationFields: DocRelationFieldValue[] = []
    for (const [fieldName, field] of Object.entries(this.schema)) {
      if (field.type !== "relation" && field.type !== "multi-relation") continue
      if (!field.path) continue
      const relationField = DocRelationFieldValue.fromProps({
        fieldName,
        relationPath: field.path,
        isArray: field.type === "multi-relation",
      })
      relationFields.push(relationField)
    }

    return relationFields
  }

  /**
   * スキーマフィールドを配列として取得
   */
  getSchemaFields(): DocSchemaFieldValue[] {
    if (!this.schema) return []

    return Object.entries(this.schema).map(([key, field]) => {
      return DocSchemaFieldValue.fromSchemaEntry(key, field)
    })
  }

  /**
   * テーブルカラムを生成
   */
  getTableColumns() {
    return this.getSchemaFields().map((field) => {
      return {
        key: field.key,
        label: field.title,
        type: field.type.type,
        path: field.path || "",
        options: field.options || [],
      }
    })
  }

  /**
   * indexFileSchemaの形式に変換
   */
  toJson(): DocFileIndex {
    return {
      ...this.value,
      columns: this.getTableColumns(),
    }
  }

  /**
   * 空のDocDirectoryを作成
   */
  static empty(path: string): DocFileIndexEntity {
    return new DocFileIndexEntity({
      id: path,
      path,
      relativePath: path,
      fileName: "index.md",
      content: "",
      title: "",
      description: "",
      directoryName: "",
      columns: [],
      frontMatter: { icon: "", schema: {} },
    })
  }

  /**
   * DocFileからDocDirectoryを作成
   */
  static fromDocFile(path: string, docFile: DocFileMdEntity) {
    const frontMatter = DocFrontMatterIndexValue.from(docFile.content)
    return new DocFileIndexEntity({
      id: docFile.id,
      path,
      relativePath: docFile.relativePath,
      fileName: "index.md",
      content: docFile.content,
      title: docFile.title || "",
      description: docFile.description || "",
      directoryName: "",
      columns: [],
      frontMatter: frontMatter.value,
    })
  }

  /**
   * Markdownファイルを解析してDocDirectoryを作成
   */
  static fromMarkdown(
    path: string,
    markdownContent: string,
  ): DocFileIndexEntity {
    const openMarkdown = new OpenMarkdown(markdownContent)
    const frontMatter = DocFrontMatterIndexValue.from(markdownContent)
    return new DocFileIndexEntity({
      id: path,
      path,
      relativePath: path,
      fileName: "index.md",
      content: markdownContent,
      title: openMarkdown.title || "",
      description: openMarkdown.description || "",
      directoryName: "",
      columns: [],
      frontMatter: frontMatter.value,
    })
  }
}
