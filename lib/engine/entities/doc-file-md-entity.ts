import { DocFrontMatterMdValue } from "@/lib/engine/values/doc-front-matter-md-value"
import { zDocFileMd } from "@/lib/models"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import type { DocFileMd } from "@/lib/types"

/**
 * ドキュメントのファイル
 */
export class DocFileMdEntity {
  constructor(readonly value: DocFileMd) {
    zDocFileMd.parse(value)
    Object.freeze(this)
  }

  /**
   * ファイルの内容
   */
  get content(): string {
    return this.value.content
  }

  /**
   * ファイルパス
   */
  get filePath(): string {
    return this.value.path
  }

  /**
   * ファイルのタイトル
   */
  get title(): string {
    return this.value.title || ""
  }

  /**
   * FrontMatter
   */
  get frontMatter(): DocFrontMatterMdValue {
    return DocFrontMatterMdValue.fromData(this.value.frontMatter)
  }

  /**
   * ID
   */
  get id(): string {
    return this.value.id
  }

  /**
   * 相対パス
   */
  get relativePath(): string {
    return this.value.relativePath
  }

  /**
   * ファイル名
   */
  get fileName(): string {
    return this.value.fileName
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
    return this.value.description || ""
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
  static from(filePath: string, markdownText: string): DocFileMdEntity {
    const openMarkdown = new OpenMarkdown(markdownText)

    const fileName = filePath.split("/").pop() || ""

    const frontMatter = DocFrontMatterMdValue.from(markdownText)

    return new DocFileMdEntity({
      id: filePath.split("/").pop()?.replace(/\.md$/, "") || "",
      path: filePath,
      relativePath: filePath,
      fileName,
      content: openMarkdown.content,
      title: openMarkdown.title || "",
      description: openMarkdown.description || "",
      frontMatter: frontMatter.value,
    })
  }

  /**
   * FrontMatterを更新した新しいDocFileを作成
   */
  withFrontMatter(frontMatter: Record<string, unknown>): DocFileMdEntity {
    const updatedData: DocFileMd = {
      ...this.value,
      frontMatter: frontMatter as DocFileMd["frontMatter"],
    }
    return new DocFileMdEntity(updatedData)
  }

  /**
   * タイトルを更新した新しいDocFileを作成
   */
  withTitle(newTitle: string): DocFileMdEntity {
    const openMarkdown = new OpenMarkdown(`# ${this.title || ""}

${this.content}`)
    const updatedMarkdown = openMarkdown.withTitle(newTitle)

    const updatedData: DocFileMd = {
      ...this.value,
      content: updatedMarkdown.content,
      title: newTitle,
    }
    return new DocFileMdEntity(updatedData)
  }

  withDescription(
    newDescription: string,
    defaultTitle?: string,
  ): DocFileMdEntity {
    const openMarkdown = new OpenMarkdown(
      [this.title || defaultTitle || "", "", this.content].join("\n"),
    )

    const updatedMarkdown = openMarkdown.withDescription(
      newDescription,
      defaultTitle,
    )

    const updatedData: DocFileMd = {
      ...this.value,
      content: updatedMarkdown.content,
      description: newDescription,
    }
    return new DocFileMdEntity(updatedData)
  }

  withContent(newContent: string): DocFileMdEntity {
    const newOpenMarkdown = new OpenMarkdown(newContent)
    const frontMatter = DocFrontMatterMdValue.from(newContent)

    const updatedData: DocFileMd = {
      ...this.value,
      content: newOpenMarkdown.content,
      title: newOpenMarkdown.title || this.title,
      description: newOpenMarkdown.description || this.description,
      frontMatter: frontMatter.value,
    }
    return new DocFileMdEntity(updatedData)
  }

  /**
   * Markdownテキストを生成
   */
  toMarkdownText(): string {
    const currentFrontMatter = this.frontMatter
    const openMarkdown = OpenMarkdown.fromProps({
      frontMatter: currentFrontMatter.value,
      content: this.content,
    })
    return openMarkdown.text
  }

  /**
   * JSON形式に変換
   */
  toJson(): DocFileMd {
    return this.value
  }
}
