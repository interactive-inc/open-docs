import { zDocFileMd } from "../models"
import type { DocFileMd, DocFilePath } from "../types"
import { DocFileContentMdValue } from "../values/doc-file-content-md-value"

/**
 * ドキュメントのファイル
 */
export class DocFileMdEntity {
  constructor(readonly value: DocFileMd) {
    zDocFileMd.parse(value)
    Object.freeze(this)
  }

  /**
   * コンテンツ
   */
  get content(): DocFileContentMdValue {
    return new DocFileContentMdValue(this.value.content)
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
  withContent(content: DocFileContentMdValue): DocFileMdEntity {
    return new DocFileMdEntity({
      ...this.value,
      content: content.value,
    })
  }

  /**
   * パスを更新
   */
  withPath(path: DocFilePath): DocFileMdEntity {
    return new DocFileMdEntity({
      ...this.value,
      path: path,
    })
  }

  /**
   * JSON形式に変換
   */
  toJson(): DocFileMd {
    return this.value
  }
}
