import { zDocRelation } from "../models"
import type { DocRelation } from "../types"
import { DocRelationFileValue } from "./doc-relation-file-value"

/**
 * リレーション情報を管理する
 */
export class DocRelationValue {
  constructor(readonly value: DocRelation) {
    zDocRelation.parse(value)
    Object.freeze(this)
    Object.freeze(this.value)
  }

  /**
   * リレーションパス
   */
  get path(): string {
    return this.value.path
  }

  /**
   * リレーション対象ファイル一覧（値オブジェクト）
   */
  get files(): DocRelationFileValue[] {
    return this.value.files.map((file) => new DocRelationFileValue(file))
  }

  /**
   * ファイル数を取得
   */
  get fileCount(): number {
    return this.files.length
  }

  /**
   * 空かどうか
   */
  get isEmpty(): boolean {
    return this.files.length === 0
  }

  /**
   * 空のリレーションエンティティを作成
   */
  static empty(path: string): DocRelationValue {
    return new DocRelationValue({
      path,
      files: [],
    })
  }

  /**
   * JSON形式で出力
   */
  toJson(): DocRelation {
    return {
      path: this.path,
      files: this.files.map((file) => file.toJson()),
    }
  }
}
