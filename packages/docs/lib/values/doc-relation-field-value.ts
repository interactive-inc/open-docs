import { zDocRelationField } from "../models"
import type { DocRelationField } from "../types"

/**
 * リレーションフィールド
 */
export class DocRelationFieldValue {
  constructor(private readonly value: DocRelationField) {
    zDocRelationField.parse(value)
    Object.freeze(this)
  }

  /**
   * フィールド名を取得
   */
  get fieldName() {
    return this.value.fieldName
  }

  /**
   * リレーション先のパスを取得
   */
  get relationPath() {
    return this.value.filePath
  }

  /**
   * 配列型かどうかを取得
   */
  get isArray() {
    return this.value.isArray
  }

  /**
   * 単一リレーションかどうかを判定
   */
  get isSingle() {
    return !this.value.isArray
  }

  /**
   * 複数リレーションかどうかを判定
   */
  get isMultiple() {
    return this.value.isArray
  }

  /**
   * リレーション先のディレクトリ名を取得
   */
  get targetDirectoryName() {
    const parts = this.value.filePath.split("/")
    return parts[parts.length - 1] || ""
  }

  /**
   * 完全なリレーションパスを生成
   */
  getFullPath(basePath: string): string {
    if (this.value.filePath.startsWith("/")) {
      return this.value.filePath
    }
    return `${basePath}/${this.value.filePath}`
  }

  /**
   * 等価性の判定
   */
  equals(other: DocRelationFieldValue): boolean {
    return (
      this.fieldName === other.fieldName &&
      this.relationPath === other.relationPath &&
      this.isArray === other.isArray
    )
  }

  /**
   * データから生成
   */
  static from(data: unknown): DocRelationFieldValue {
    const validated = zDocRelationField.parse(data)
    return new DocRelationFieldValue(validated)
  }

  /**
   * プロパティから生成
   */
  static fromProps(props: {
    fieldName: string
    filePath: string
    isArray: boolean
  }): DocRelationFieldValue {
    return new DocRelationFieldValue(props)
  }

  /**
   * JSON形式に変換
   */
  toJson(): DocRelationField {
    return { ...this.value }
  }
}
