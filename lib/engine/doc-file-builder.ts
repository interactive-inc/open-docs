import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import { DocFrontMatterBuilder } from "./doc-front-matter-builder"

type Props = {
  content: string
  filePath: string
  frontMatter?: DocFrontMatterBuilder
  title?: string
}

/**
 * ドキュメントのファイル
 */
export class DocFileBuilder {
  readonly content: string

  readonly filePath: string

  readonly frontMatter: DocFrontMatterBuilder

  readonly title: string

  constructor(props: Props) {
    this.content = props.content
    this.filePath = props.filePath
    this.frontMatter = props.frontMatter || DocFrontMatterBuilder.empty()
    this.title = props.title || ""
  }

  /**
   * ファイルサイズ（文字数）を取得
   */
  get size(): number {
    return this.content.length
  }

  /**
   * ディスクリプションを取得
   */
  get description(): string {
    const openMarkdown = new OpenMarkdown(
      `${this.title ? `# ${this.title}\n\n` : ""}${this.content}`,
    )
    return openMarkdown.description || ""
  }

  /**
   * ファイル名を取得
   */
  get fileName(): string {
    const parts = this.filePath.split("/")
    return parts[parts.length - 1] || ""
  }

  /**
   * 拡張子を取得
   */
  get extension(): string {
    const fileName = this.fileName
    const lastDot = fileName.lastIndexOf(".")
    return lastDot !== -1 ? fileName.substring(lastDot + 1) : ""
  }

  /**
   * Markdownテキストから生成
   */
  static from(filePath: string, markdownText: string): DocFileBuilder {
    const openMarkdown = new OpenMarkdown(markdownText)
    const frontMatter = DocFrontMatterBuilder.from(markdownText)

    return new DocFileBuilder({
      content: openMarkdown.content,
      filePath,
      frontMatter,
      title: openMarkdown.title,
    })
  }

  /**
   * FrontMatterを更新した新しいDocFileを作成
   */
  withFrontMatter(frontMatter: Record<string, unknown>): DocFileBuilder {
    const newFrontMatterData = { ...this.frontMatter.data, ...frontMatter }
    return new DocFileBuilder({
      content: this.content,
      filePath: this.filePath,
      frontMatter: DocFrontMatterBuilder.fromData(newFrontMatterData),
      title: this.title,
    })
  }

  /**
   * タイトルを更新した新しいDocFileを作成
   */
  withTitle(newTitle: string): DocFileBuilder {
    const openMarkdown = new OpenMarkdown(`# ${this.title || ""}

${this.content}`)
    const updatedMarkdown = openMarkdown.withTitle(newTitle)

    return new DocFileBuilder({
      content: updatedMarkdown.content,
      filePath: this.filePath,
      frontMatter: this.frontMatter,
      title: newTitle,
    })
  }

  withDescription(
    newDescription: string,
    defaultTitle?: string,
  ): DocFileBuilder {
    const openMarkdown = new OpenMarkdown(
      [this.title || defaultTitle || "", "", this.content].join("\n"),
    )

    const updatedMarkdown = openMarkdown.withDescription(
      newDescription,
      defaultTitle,
    )

    return new DocFileBuilder({
      content: updatedMarkdown.content,
      filePath: this.filePath,
      frontMatter: this.frontMatter,
      title: this.title,
    })
  }

  withContent(newContent: string): DocFileBuilder {
    const newOpenMarkdown = new OpenMarkdown(newContent)

    const existingBodyFrontMatter = newOpenMarkdown.frontMatter.data || {}

    const mergedFrontMatter = {
      ...this.frontMatter.data,
      ...existingBodyFrontMatter,
    }

    return new DocFileBuilder({
      content: newOpenMarkdown.content,
      filePath: this.filePath,
      frontMatter: DocFrontMatterBuilder.fromData(mergedFrontMatter),
      title: this.title,
    })
  }

  /**
   * Markdownテキストを生成
   */
  toMarkdownText(): string {
    const openMarkdown = OpenMarkdown.fromProps({
      frontMatter: this.frontMatter.data as Record<string, unknown>,
      content: this.content,
    })
    return openMarkdown.text
  }

  /**
   * directoryFileSchemaの形式に変換
   */
  toDirectoryFile() {
    return {
      path: this.filePath,
      fileName: this.fileName,
      content: this.content,
      title: this.title || null,
      description: this.description || null,
      frontMatter: this.frontMatter.data || null,
    }
  }
}
