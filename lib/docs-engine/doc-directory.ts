import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import { directoryFrontMatterSchema } from "@/lib/validations/directory-front-matter-schema"
import type { Schema } from "@/lib/validations/doc-schema"
import type { DocFile } from "./doc-file"
import { DocDirectoryFrontMatter } from "./models/doc-directory-front-matter"

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
  } {
    return {
      isFile: false,
      schema: this.schema,
      title: this.title,
      description: this.description,
      icon: this.icon,
      path: this.path,
      indexPath: this.indexPath,
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
    const validation = docFile.frontMatter.validateWith(
      directoryFrontMatterSchema,
    )

    if (validation.success) {
      return new DocDirectory({
        schema: validation.data.schema || {},
        title: docFile.title || docFile.frontMatter.title,
        description: null,
        icon: docFile.frontMatter.icon,
        path,
      })
    }

    const rawData = docFile.frontMatter.data as Record<string, unknown>

    const schema = (rawData?.schema as Schema) || {}

    return new DocDirectory({
      schema,
      title: docFile.title || docFile.frontMatter.title,
      description: null,
      icon: docFile.frontMatter.icon,
      path,
    })
  }

  /**
   * Markdownファイルを解析してDocDirectoryを作成
   */
  static fromMarkdown(path: string, markdownContent: string): DocDirectory {
    const openMarkdown = new OpenMarkdown(markdownContent)

    const frontMatter = DocDirectoryFrontMatter.from(
      openMarkdown.frontMatter.data ?? {},
    )

    const validation = frontMatter.validateWith(directoryFrontMatterSchema)

    if (validation.success) {
      return new DocDirectory({
        schema: validation.data.schema || {},
        title: openMarkdown.title || frontMatter.title,
        description: frontMatter.description,
        icon: frontMatter.icon,
        path,
      })
    }

    const rawData = openMarkdown.frontMatter.data || {}

    const schema = (rawData?.schema as Schema) || {}

    return new DocDirectory({
      schema,
      title: openMarkdown.title || frontMatter.title,
      description: frontMatter.description,
      icon: frontMatter.icon,
      path,
    })
  }
}
