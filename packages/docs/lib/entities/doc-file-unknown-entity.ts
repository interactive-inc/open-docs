import { zDocFileUnknown } from "../models"
import type { DocFilePath, DocFileUnknown } from "../types"

/**
 * ドキュメントのファイル
 */
export class DocFileUnknownEntity {
  constructor(readonly value: DocFileUnknown) {
    zDocFileUnknown.parse(value)
    Object.freeze(this)
  }

  /**
   * コンテンツ
   */
  get content(): string {
    return this.value.content
  }

  /**
   * パス情報
   */
  get path(): DocFilePath {
    return this.value.path
  }

  /**
   * コンテンツを更新
   */
  withContent(content: string): DocFileUnknownEntity {
    return new DocFileUnknownEntity({
      ...this.value,
      content: content,
    })
  }

  /**
   * パスを更新
   */
  withPath(path: DocFilePath): DocFileUnknownEntity {
    return new DocFileUnknownEntity({
      ...this.value,
      path: path,
    })
  }

  toJson(): DocFileUnknown {
    return this.value
  }
}
