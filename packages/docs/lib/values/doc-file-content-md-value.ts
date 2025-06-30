import { DocMarkdownSystem } from "../doc-markdown-system"
import { zDocFileContentMd } from "../models"
import type { DocFileContentMd } from "../types"
import { DocFrontMatterMdValue } from "./doc-front-matter-md-value"

/**
 * Markdownコンテンツ情報の値オブジェクト
 */
export class DocFileContentMdValue {
  constructor(readonly value: DocFileContentMd) {
    zDocFileContentMd.parse(value)
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
  get frontMatter(): DocFrontMatterMdValue {
    return new DocFrontMatterMdValue(this.value.frontMatter)
  }

  /**
   * タイトルを更新
   */
  withTitle(title: string): DocFileContentMdValue {
    const fullText = this.toText()
    const engine = new DocMarkdownSystem()
    const updatedText = engine.updateTitle(fullText, title)
    const updatedBody = engine.extractBody(updatedText)
    return new DocFileContentMdValue({
      type: "markdown-content",
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
  ): DocFileContentMdValue {
    const fullText = this.toText()
    const engine = new DocMarkdownSystem()
    const updatedText = engine.updateDescription(
      fullText,
      description,
      defaultTitle || this.title,
    )
    const updatedBody = engine.extractBody(updatedText)
    return new DocFileContentMdValue({
      type: "markdown-content",
      body: updatedBody,
      title: this.title,
      description,
      frontMatter: this.value.frontMatter,
    })
  }

  /**
   * コンテンツを更新
   */
  withContent(content: string): DocFileContentMdValue {
    const engine = new DocMarkdownSystem()
    return new DocFileContentMdValue({
      type: "markdown-content",
      body: content,
      title: engine.extractTitle(content) || "",
      description: engine.extractDescription(content) || "",
      frontMatter: this.value.frontMatter,
    })
  }

  /**
   * FrontMatterを更新
   */
  withFrontMatter(frontMatter: DocFrontMatterMdValue): DocFileContentMdValue {
    return new DocFileContentMdValue({
      type: "markdown-content",
      body: this.body,
      title: this.title,
      description: this.description,
      frontMatter: frontMatter.value,
    })
  }

  /**
   * Markdownテキストから生成
   */
  static fromMarkdown(markdown: string): DocFileContentMdValue {
    const engine = new DocMarkdownSystem()
    const frontMatter = DocFrontMatterMdValue.from(markdown)

    return new DocFileContentMdValue({
      type: "markdown-content",
      body: engine.extractBody(markdown),
      title: engine.extractTitle(markdown) || "",
      description: engine.extractDescription(markdown) || "",
      frontMatter: frontMatter.value,
    })
  }

  /**
   * 完全なMarkdownテキストを生成
   */
  toMarkdownText(): string {
    return DocMarkdownSystem.from(this.title, this.description, this.body)
  }

  /**
   * FrontMatterとbodyを結合した完全なテキストを生成
   */
  toText(): string {
    return `---\n${this.frontMatter.toYaml()}\n---\n\n${this.body}`
  }

  /**
   * 空のコンテンツを生成
   */
  static empty(title: string): DocFileContentMdValue {
    return new DocFileContentMdValue({
      type: "markdown-content",
      body: `# ${title}`,
      title,
      description: "",
      frontMatter: {},
    })
  }

  /**
   * JSON形式で出力
   */
  toJson(): DocFileContentMd {
    return this.value
  }
}
