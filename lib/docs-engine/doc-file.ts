import type { Schema } from "@/lib/docs-engine/models/doc-schema"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"

type Props<T = Record<string, unknown>> = {
  content: string
  filePath: string
  frontMatter?: { data: T }
  title?: string
}

/**
 * ドキュメントのファイル
 */
export class DocFile<T = Record<string, unknown>> {
  readonly content: string

  readonly filePath: string

  readonly frontMatter: { data: T }

  readonly title: string

  constructor(props: Props<T>) {
    this.content = props.content
    this.filePath = props.filePath
    this.frontMatter = props.frontMatter || { data: {} as T }
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
   * スキーマを設定した新しいDocFileを作成
   */
  withSchema<U = Record<string, unknown>>(schema: Schema): DocFile<U> {
    return new DocFile<U>({
      content: this.content,
      filePath: this.filePath,
      frontMatter: { data: this.frontMatter.data as unknown as U },
      title: this.title,
    })
  }

  /**
   * FrontMatterを更新した新しいDocFileを作成
   */
  withFrontMatter(frontMatter: Record<string, unknown>): DocFile<T> {
    return new DocFile<T>({
      content: this.content,
      filePath: this.filePath,
      frontMatter: { data: { ...this.frontMatter.data, ...frontMatter } as T },
      title: this.title,
    })
  }

  /**
   * タイトルを更新した新しいDocFileを作成
   */
  withTitle(newTitle: string): DocFile<T> {
    const openMarkdown = new OpenMarkdown(`# ${this.title || ""}

${this.content}`)
    const updatedMarkdown = openMarkdown.withTitle(newTitle)

    return new DocFile<T>({
      content: updatedMarkdown.content,
      filePath: this.filePath,
      frontMatter: this.frontMatter,
      title: newTitle,
    })
  }

  /**
   * ディスクリプションを更新した新しいDocFileを作成
   */
  withDescription(newDescription: string, defaultTitle?: string): DocFile<T> {
    const openMarkdown = new OpenMarkdown(`# ${this.title || defaultTitle || ""}

${this.content}`)
    const updatedMarkdown = openMarkdown.withDescription(
      newDescription,
      defaultTitle,
    )

    return new DocFile<T>({
      content: updatedMarkdown.content,
      filePath: this.filePath,
      frontMatter: this.frontMatter,
      title: this.title,
    })
  }

  /**
   * コンテンツを更新した新しいDocFileを作成（FrontMatterをマージ）
   */
  withContent(newContent: string): DocFile<T> {
    const newOpenMarkdown = new OpenMarkdown(newContent)
    const existingBodyFrontMatter = newOpenMarkdown.frontMatter.data || {}
    const mergedFrontMatter = {
      ...this.frontMatter.data,
      ...existingBodyFrontMatter,
    }

    return new DocFile<T>({
      content: newOpenMarkdown.content,
      filePath: this.filePath,
      frontMatter: { data: mergedFrontMatter as T },
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
   * JSON形式に変換
   */
  toJSON(): {
    isFile: true
    content: string
    filePath: string
    frontMatter: Record<string, unknown>
    title: string
  } {
    return {
      isFile: true,
      content: this.content,
      filePath: this.filePath,
      frontMatter: this.frontMatter.data as Record<string, unknown>,
      title: this.title,
    }
  }
}
