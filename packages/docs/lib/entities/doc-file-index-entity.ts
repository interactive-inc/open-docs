import { zDocFileIndex } from "../models"
import type { DocFileIndex, DocFilePath } from "../types"
import { DocFileContentIndexValue } from "../values/doc-file-content-index-value"

/**
 * ドキュメントのディレクトリ
 */
export class DocFileIndexEntity {
  constructor(readonly value: DocFileIndex) {
    zDocFileIndex.parse(value)
    Object.freeze(this)
  }

  /**
   * コンテンツ
   */
  get content(): DocFileContentIndexValue {
    return new DocFileContentIndexValue(this.value.content)
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
  withContent(content: DocFileContentIndexValue): DocFileIndexEntity {
    return new DocFileIndexEntity({
      ...this.value,
      content: content.value,
    })
  }

  /**
   * パスを更新
   */
  withPath(path: DocFilePath): DocFileIndexEntity {
    return new DocFileIndexEntity({
      ...this.value,
      path: path,
    })
  }

  /**
   * indexFileSchemaの形式に変換
   */
  toJson(): DocFileIndex {
    return this.value
  }
}
