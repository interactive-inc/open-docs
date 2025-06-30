import { DocMarkdownSystem } from "../doc-markdown-system"
import { zDocFileContentIndex } from "../models"
import type { DocFileContentIndex } from "../types"
import { DocFrontMatterIndexValue } from "./doc-front-matter-index-value"

/**
 * Indexファイルコンテンツ情報の値オブジェクト
 */
export class DocFileContentIndexValue {
  constructor(readonly value: DocFileContentIndex) {
    zDocFileContentIndex.parse(value)
    Object.freeze(this)
  }

  /**
   * コンテンツ本文（frontMatterを含まない）
   */
  get body(): string {
    return this.value.body
  }

  /**
   * タイトル
   */
  get title(): string {
    return this.value.title
  }

  /**
   * 説明
   */
  get description(): string {
    return this.value.description
  }

  /**
   * FrontMatter
   */
  get frontMatter(): DocFrontMatterIndexValue {
    return new DocFrontMatterIndexValue(this.value.frontMatter)
  }

  /**
   * タイトルを更新
   */
  withTitle(title: string): DocFileContentIndexValue {
    const fullText = this.toText()
    const engine = new DocMarkdownSystem()
    const updatedText = engine.updateTitle(fullText, title)
    const updatedBody = engine.extractBody(updatedText)
    return new DocFileContentIndexValue({
      type: "markdown-index",
      body: updatedBody,
      title,
      description: this.description,
      frontMatter: this.value.frontMatter,
    })
  }

  /**
   * 説明を更新
   */
  withDescription(
    description: string,
    defaultTitle?: string,
  ): DocFileContentIndexValue {
    const fullText = this.toText()
    const engine = new DocMarkdownSystem()
    const updatedText = engine.updateDescription(
      fullText,
      description,
      defaultTitle || this.title,
    )
    const updatedBody = engine.extractBody(updatedText)
    return new DocFileContentIndexValue({
      type: "markdown-index",
      body: updatedBody,
      title: this.title,
      description,
      frontMatter: this.value.frontMatter,
    })
  }

  /**
   * Markdownテキストから生成
   */
  static fromMarkdown(markdown: string): DocFileContentIndexValue {
    const engine = new DocMarkdownSystem()
    const frontMatter = DocFrontMatterIndexValue.from(markdown)

    return new DocFileContentIndexValue({
      type: "markdown-index",
      body: engine.extractBody(markdown),
      title: engine.extractTitle(markdown) || "",
      description: engine.extractDescription(markdown) || "",
      frontMatter: frontMatter.toJson(),
    })
  }

  /**
   * 完全なMarkdownテキストを生成
   */
  toMarkdownText(): string {
    return DocMarkdownSystem.from(this.title, this.description, this.body)
  }

  /**
   * コンテンツを更新
   */
  withContent(content: string): DocFileContentIndexValue {
    const engine = new DocMarkdownSystem()
    return new DocFileContentIndexValue({
      type: "markdown-index",
      body: content,
      title: engine.extractTitle(content) || "",
      description: engine.extractDescription(content) || "",
      frontMatter: this.value.frontMatter,
    })
  }

  /**
   * FrontMatterを更新
   */
  withFrontMatter(frontMatter: DocFrontMatterIndexValue) {
    return new DocFileContentIndexValue({
      type: "markdown-index",
      body: this.body,
      title: this.title,
      description: this.description,
      frontMatter: frontMatter.toJson(),
    })
  }

  /**
   * デフォルトのindex.mdコンテンツを生成
   */
  static empty(directoryName: string): DocFileContentIndexValue {
    const content = `---\ntitle: "${directoryName}"\ndescription: ""\nicon: ""\nschema: {}\n---\n\n# ${directoryName}\n`
    return DocFileContentIndexValue.fromMarkdown(content)
  }

  /**
   * FrontMatterとbodyを結合した完全なテキストを生成
   */
  toText(): string {
    return `---\n${this.frontMatter.toYaml()}\n---\n\n${this.body}`
  }

  /**
   * JSON形式で出力
   */
  toJson(): DocFileContentIndex {
    return this.value
  }
}
