import { OpenMarkdownFrontmatter } from "./open-markdown-frontmatter"

/**
 * Markdownの解析と生成を行うイミュータブルクラス
 */
export class OpenMarkdown {
  constructor(readonly text: string) {}

  /**
   * Front Matter
   */
  get frontMatter(): OpenMarkdownFrontmatter {
    return OpenMarkdownFrontmatter.fromMarkdown(this.text)
  }

  /**
   * body
   */
  get content(): string {
    if (!this.text || typeof this.text !== "string") {
      return this.text || ""
    }

    if (!this.text.startsWith("---")) {
      return this.text
    }

    const startIndex = this.text.indexOf("---")
    const endIndex = this.text.indexOf("---", startIndex + 3)

    if (endIndex === -1) {
      return this.text
    }

    let content = this.text.slice(endIndex + 3)

    if (this.text.slice(endIndex + 3).startsWith("\n\n")) {
      content = `\n${this.text.slice(endIndex + 4).trim()}`
    } else {
      content = this.text.slice(endIndex + 3).trim()
    }

    return content.trim()
  }

  /**
   * title
   */
  get title(): string {
    const content = this.content
    if (!content || typeof content !== "string") {
      return ""
    }

    const titleMatch = content.match(/^#\s+(.*?)$/m)

    if (!titleMatch || !titleMatch[1]) {
      return ""
    }

    return titleMatch[1].trim()
  }

  /**
   * 新しいフロントマターとコンテンツでMarkdownインスタンスを作成
   */
  public static fromProps(props: {
    frontMatter: Record<string, unknown>
    content: string
  }): OpenMarkdown {
    const contentOpenMarkdown = new OpenMarkdown(props.content)
    const existingContent = contentOpenMarkdown.content

    // 新しいフロントマターでMarkdownテキストを生成
    const frontMatterInstance = OpenMarkdownFrontmatter.fromFrontMatter(
      props.frontMatter,
    )
    const frontMatterText = frontMatterInstance.frontMatterText()
    const markdownText =
      `---\n${frontMatterText}\n---\n\n${existingContent}`.trim()

    return new OpenMarkdown(markdownText)
  }

  /**
   * 現在のフロントマターをYAMLテキストに変換する
   */
  public frontMatterToText(): string {
    return this.frontMatter.frontMatterText()
  }

  /**
   * 現在のフロントマターを更新して新しいMarkdownテキストを生成
   */
  public updateFrontMatter(draft: Record<string, unknown>): string {
    const updatedFrontMatter = this.frontMatter.update(draft)
    return OpenMarkdown.fromProps({
      frontMatter: updatedFrontMatter.data || {},
      content: this.content,
    }).text
  }

  /**
   * 新しいフロントマターでOpenMarkdownインスタンスを作成
   */
  public withFrontMatter(frontMatter: Record<string, unknown>): OpenMarkdown {
    return OpenMarkdown.fromProps({
      frontMatter,
      content: this.content,
    })
  }

  /**
   * フロントマターを更新した新しいOpenMarkdownインスタンスを作成
   */
  public withUpdatedFrontMatter(draft: Record<string, unknown>): OpenMarkdown {
    const updatedFrontMatter = this.frontMatter.update(draft)
    return this.withFrontMatter(updatedFrontMatter.data || {})
  }
}
