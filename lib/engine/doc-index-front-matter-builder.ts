import { indexFrontMatterSchema } from "@/lib/models"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import type { Schema } from "@/lib/types"

/**
 * index.mdファイルのFrontMatterを管理するクラス
 */
export class DocIndexFrontMatterBuilder {
  readonly icon: string | null
  readonly schema: Schema

  constructor(props: { icon: string | null; schema: Schema }) {
    this.icon = props.icon
    this.schema = props.schema
  }

  /**
   * Markdownテキストから生成
   */
  static from(markdownText: string): DocIndexFrontMatterBuilder {
    const openMarkdown = new OpenMarkdown(markdownText)

    if (openMarkdown.frontMatter === null) {
      throw new Error("FrontMatter is null")
    }

    const rawData = openMarkdown.frontMatter.data || {}

    // indexFrontMatterSchemaでバリデーション
    const result = indexFrontMatterSchema.safeParse(rawData)

    if (result.success === false) {
      return DocIndexFrontMatterBuilder.empty()
    }

    return new DocIndexFrontMatterBuilder({
      icon: result.data.icon || null,
      schema: (result.data.schema as Schema) || {},
    })
  }

  /**
   * 空のFrontMatterを生成
   */
  static empty(): DocIndexFrontMatterBuilder {
    return new DocIndexFrontMatterBuilder({
      icon: null,
      schema: {},
    })
  }

  /**
   * データから直接生成
   */
  static fromData(data: Record<string, unknown>): DocIndexFrontMatterBuilder {
    const validatedData = indexFrontMatterSchema.safeParse(data)
    const frontMatterData = validatedData.success ? validatedData.data : {}

    return new DocIndexFrontMatterBuilder({
      icon: frontMatterData?.icon || null,
      schema: (frontMatterData?.schema as Schema) || {},
    })
  }

  /**
   * JSON形式で出力
   */
  toJSON() {
    return {
      icon: this.icon,
      schema: this.schema,
    }
  }
}
