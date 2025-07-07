import { DocContentMdFrontMatterValue } from "./doc-content-md-front-matter-value"

/**
 * Markdownの解析と生成
 */
export class DocContentMdValue {
  constructor(readonly text: string) {}

  /**
   * Front Matter
   */
  get frontMatter(): DocContentMdFrontMatterValue {
    return DocContentMdFrontMatterValue.fromMarkdown(this.text)
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
   * H1の次の段落、またはH1がない場合は最初の段落をdescriptionとして取得する
   */
  public get description(): string | null {
    const content = this.content

    // H1を見つける
    const h1Match = content.match(/^#\s+(.+)$/m)

    let searchContent: string
    if (h1Match) {
      // H1がある場合は、H1の後の内容から検索
      const h1EndIndex = (h1Match.index ?? 0) + h1Match[0].length
      searchContent = content.substring(h1EndIndex)
    } else {
      // H1がない場合は、コンテンツ全体から検索
      searchContent = content
    }

    // 空行をスキップして最初の段落を取得（見出しやリストが来るまで）
    const paragraphMatch = searchContent.match(
      /^\s*\n*([^#\n*-][^\n]*(?:\n(?![#\s*-])[^\n]*)*)/m,
    )

    return paragraphMatch ? (paragraphMatch[1]?.trim() ?? null) : null
  }

  /**
   * 新しいフロントマターとコンテンツでMarkdownインスタンスを作成
   */
  public static fromProps(props: {
    frontMatter: Record<string, unknown>
    content: string
  }): DocContentMdValue {
    const contentOpenMarkdown = new DocContentMdValue(props.content)
    const existingContent = contentOpenMarkdown.content

    // 新しいフロントマターでMarkdownテキストを生成
    const frontMatterInstance = DocContentMdFrontMatterValue.fromFrontMatter(
      props.frontMatter,
    )
    const frontMatterText = frontMatterInstance.frontMatterText()

    let markdownText: string
    if (frontMatterText) {
      markdownText = `---\n${frontMatterText}\n---\n\n${existingContent}`.trim()
    } else {
      markdownText = existingContent
    }

    return new DocContentMdValue(markdownText)
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
    return DocContentMdValue.fromProps({
      frontMatter: updatedFrontMatter.data || {},
      content: this.content,
    }).text
  }

  /**
   * 新しいフロントマターでOpenMarkdownインスタンスを作成
   */
  public withFrontMatter(
    frontMatter: Record<string, unknown>,
  ): DocContentMdValue {
    return DocContentMdValue.fromProps({
      frontMatter,
      content: this.content,
    })
  }

  /**
   * フロントマターを更新した新しいOpenMarkdownインスタンスを作成
   */
  public withUpdatedFrontMatter(
    draft: Record<string, unknown>,
  ): DocContentMdValue {
    const updatedFrontMatter = this.frontMatter.update(draft)
    return this.withFrontMatter(updatedFrontMatter.data || {})
  }

  /**
   * マークダウンをtitle、description、本文の3つの部分に分離する
   */
  private parseContentParts(): {
    title: string | null
    description: string | null
    body: string
  } {
    const content = this.content

    // H1を見つける
    const h1Match = content.match(/^#\s+(.+)$/m)

    if (!h1Match) {
      // H1がない場合、最初の段落をdescriptionとして抽出
      const paragraphMatch = content.match(
        /^(\s*)([^#\n*-][^\n]*(?:\n(?![#\s*-])[^\n]*)*)(.*)/ms,
      )

      if (paragraphMatch) {
        const [, , descriptionPart, remaining] = paragraphMatch
        return {
          title: null,
          description: descriptionPart?.trim() ?? "",
          body: remaining?.trim() ?? "",
        }
      }

      return {
        title: null,
        description: null,
        body: content.trim(),
      }
    }

    const title = h1Match[1]?.trim() ?? ""
    const h1EndIndex = (h1Match.index ?? 0) + h1Match[0].length
    const afterH1 = content.substring(h1EndIndex)

    // description段落を見つける
    const paragraphMatch = afterH1.match(
      /^(\s*\n*)([^#\n*-][^\n]*(?:\n(?![#\s*-])[^\n]*)*)(.*)/ms,
    )

    if (paragraphMatch) {
      const [, , descriptionPart, remaining] = paragraphMatch
      return {
        title,
        description: descriptionPart?.trim() ?? "",
        body: remaining?.trim() ?? "",
      }
    }
    return {
      title,
      description: null,
      body: afterH1.trim(),
    }
  }

  /**
   * title、description、本文からマークダウンを構築する
   */
  private buildContent(
    title: string | null,
    description: string | null,
    body: string,
  ): string {
    const parts: string[] = []

    if (title) {
      parts.push(`# ${title}`)
    }

    if (description) {
      parts.push(description)
    }

    if (body) {
      parts.push(body)
    }

    return parts.join("\n\n")
  }

  /**
   * H1タイトルを更新した新しいOpenMarkdownインスタンスを作成
   */
  public withTitle(newTitle: string): DocContentMdValue {
    const { description, body } = this.parseContentParts()
    const updatedContent = this.buildContent(newTitle, description, body)

    // 既存のFrontMatterを保持
    const frontMatterData =
      this.frontMatter.data !== null ? this.frontMatter.data : {}

    return DocContentMdValue.fromProps({
      frontMatter: frontMatterData,
      content: updatedContent,
    })
  }

  /**
   * H1の次のdescription段落を更新した新しいOpenMarkdownインスタンスを作成
   * @param newDescription 新しいdescription
   * @param defaultTitle H1がない場合に使用するデフォルトタイトル
   */
  public withDescription(
    newDescription: string,
    defaultTitle?: string,
  ): DocContentMdValue {
    const { title, body } = this.parseContentParts()

    // H1がない場合、デフォルトタイトルを使用
    const finalTitle = title || defaultTitle
    if (!finalTitle) {
      // タイトルが提供されない場合は変更しない
      return this
    }

    const updatedContent = this.buildContent(finalTitle, newDescription, body)

    // 既存のFrontMatterを保持
    const frontMatterData =
      this.frontMatter.data !== null ? this.frontMatter.data : {}

    return DocContentMdValue.fromProps({
      frontMatter: frontMatterData,
      content: updatedContent,
    })
  }
}
