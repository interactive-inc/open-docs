/**
 * Markdownの解析と処理システム
 */
export class DocMarkdownSystem {
  private readonly frontMatterSeparator = "---"

  constructor() {
    Object.freeze(this)
  }

  /**
   * FrontMatterの区切り線を検出
   */
  private detectFrontMatterSeparator(text: string): string {
    const firstLine = text.split("\n")[0]

    if (firstLine?.match(/^-{3,}$/)) {
      return firstLine
    }

    return this.frontMatterSeparator
  }

  /**
   * FrontMatterを抽出
   */
  extractFrontMatter(text: string): string | null {
    const separator = this.detectFrontMatterSeparator(text)
    if (!text.startsWith(separator)) {
      return null
    }

    const endIndex = text.indexOf(`\n${separator}`, separator.length)
    if (endIndex === -1) {
      return null
    }

    return text.slice(0, endIndex + separator.length + 1)
  }

  /**
   * FrontMatterを除去したbody（titleとdescriptionを含む）
   */
  extractBody(text: string): string {
    const frontMatter = this.extractFrontMatter(text)
    if (!frontMatter) {
      return text
    }

    return text.slice(frontMatter.length).trim()
  }

  /**
   * タイトル
   */
  extractTitle(text: string): string | null {
    const body = this.extractBody(text)
    const titleMatch = body.match(/^#\s+(.+)$/m)
    return titleMatch?.[1] ?? null
  }

  /**
   * 説明（タイトルの後の最初の段落）
   */
  extractDescription(text: string): string | null {
    const title = this.extractTitle(text)
    if (!title) {
      return null
    }

    const body = this.extractBody(text)
    const lines = body.split("\n")
    const titleIndex = lines.findIndex((line) => line.match(/^#\s+/))
    if (titleIndex === -1) {
      return null
    }

    const descIndex = this.skipEmptyLines(lines, titleIndex + 1)
    if (descIndex < lines.length && !lines[descIndex]?.startsWith("#")) {
      return lines[descIndex] ?? null
    }

    return null
  }

  /**
   * body内のタイトルを更新
   */
  updateTitle(text: string, newTitle: string): string {
    const body = this.extractBody(text)
    const lines = body.split("\n")
    const titleIndex = lines.findIndex((line) => line.match(/^#\s+/))

    if (titleIndex !== -1) {
      lines[titleIndex] = `# ${newTitle}`
    } else {
      // タイトルが存在しない場合は先頭に追加
      lines.unshift(`# ${newTitle}`, "")
    }

    const updatedBody = lines.join("\n")
    const frontMatter = this.extractFrontMatter(text)
    return frontMatter ? `${frontMatter}\n${updatedBody}` : updatedBody
  }

  /**
   * body内の説明を更新
   */
  updateDescription(
    text: string,
    newDescription: string,
    defaultTitle: string,
  ): string {
    const body = this.extractBody(text)
    const lines = body.split("\n")
    const titleIndex = lines.findIndex((line) => line.match(/^#\s+/))

    let updatedBody: string
    if (titleIndex === -1) {
      // タイトルがない場合はタイトルと説明を追加
      updatedBody = `# ${defaultTitle}\n\n${newDescription}\n\n${body}`.trim()
    } else {
      // タイトルの後の説明を更新
      const descIndex = this.skipEmptyLines(lines, titleIndex + 1)

      if (
        descIndex < lines.length &&
        lines[descIndex] &&
        !lines[descIndex].startsWith("#")
      ) {
        // 既存の説明を置き換え
        lines[descIndex] = newDescription
      } else {
        // 説明がない場合は挿入
        lines.splice(titleIndex + 1, 0, "", newDescription)
      }
      updatedBody = lines.join("\n")
    }

    const frontMatter = this.extractFrontMatter(text)
    return frontMatter ? `${frontMatter}\n${updatedBody}` : updatedBody
  }

  /**
   * 空行をスキップ
   */
  private skipEmptyLines(lines: string[], startIndex: number): number {
    let index = startIndex
    while (index < lines.length) {
      const line = lines[index]
      if (line === undefined || line.trim() !== "") {
        break
      }
      index++
    }
    return index
  }

  /**
   * Markdownテキストを生成（タイトル + 説明 + body）
   */
  static from(title: string, description: string, body: string): string {
    const parts: string[] = []

    if (title) {
      parts.push(`# ${title}`)
    }

    if (description) {
      if (title) parts.push("")
      parts.push(description)
    }

    if (body) {
      if (title || description) parts.push("")
      parts.push(body)
    }

    return parts.join("\n")
  }
}
