import type { Schema } from "@/lib/validations/doc-schema"
import { DocFileFrontMatter } from "./models/doc-file-front-matter"

type Props<T = Record<string, unknown>> = {
  content: string
  filePath: string
  frontMatter?: DocFileFrontMatter<T>
  title?: string
}

/**
 * ドキュメントのファイル
 */
export class DocFile<T = Record<string, unknown>> {
  readonly content: string

  readonly filePath: string

  readonly frontMatter: DocFileFrontMatter<T>

  readonly title: string

  constructor(props: Props<T>) {
    this.content = props.content
    this.filePath = props.filePath
    this.frontMatter = props.frontMatter || DocFileFrontMatter.empty<T>()
    this.title = props.title || ""
  }

  /**
   * ファイルサイズ（文字数）を取得
   */
  get size(): number {
    return this.content.length
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
      frontMatter: this.frontMatter.withSchema<U>(schema),
      title: this.title,
    })
  }

  /**
   * JSON形式に変換
   */
  toJSON(): {
    isFile: true
    content: string
    filePath: string
    frontMatter: Record<string, unknown>
    validatedFrontMatter: Record<string, unknown>
    title: string
  } {
    return {
      isFile: true,
      content: this.content,
      filePath: this.filePath,
      frontMatter: this.frontMatter.data as Record<string, unknown>,
      validatedFrontMatter: this.frontMatter.validated as Record<
        string,
        unknown
      >,
      title: this.title,
    }
  }
}
