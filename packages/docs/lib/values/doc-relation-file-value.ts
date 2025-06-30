import { zDocRelationFile } from "../models"
import type { DocRelationFile } from "../types"

/**
 * リレーションファイル
 */
export class DocRelationFileValue {
  constructor(private readonly value: DocRelationFile) {
    zDocRelationFile.parse(value)
    Object.freeze(this)
    Object.freeze(this.value)
  }

  /**
   * ファイルパス
   */
  get id() {
    return this.value.name
  }

  /**
   * スラッグ
   */
  get slug() {
    return this.value.name
  }

  /**
   * 表示用ラベル
   */
  get label() {
    return this.value.label || this.value.name
  }

  /**
   * ファイルパスとタイトルから生成
   */
  static from(filePath: string, title: string | null): DocRelationFileValue {
    const fileName = DocRelationFileValue.extractFileName(filePath)
    return new DocRelationFileValue({
      name: fileName,
      label: title || fileName,
      value: null,
      path: null,
    } satisfies DocRelationFile)
  }

  /**
   * ファイルパスからファイル名を抽出（拡張子なし）
   */
  private static extractFileName(filePath: string): string {
    return filePath.split("/").pop()?.replace(".md", "") || filePath
  }

  /**
   * JSON形式に変換
   */
  toJson(): DocRelationFile {
    return { ...this.value }
  }
}
