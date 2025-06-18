import { zDocRelation } from "@/lib/models"
import type { DocRelation } from "@/lib/types"
import { DocRelationFileValue } from "./doc-relation-file-value"

/**
 * リレーション情報を管理する
 */
export class DocRelationValue {
  constructor(readonly value: DocRelation) {
    zDocRelation.parse(value)
    Object.freeze(this)
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
   * リレーション対象ファイル一覧（生データ）
   */
  get rawFiles(): Array<{ value: string; label: string; path: string }> {
    return this.value.files
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
   * データから直接作成
   */
  static fromData(data: DocRelation): DocRelationValue {
    return new DocRelationValue(data)
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
}
