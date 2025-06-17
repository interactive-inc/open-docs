import { zDocRelationFile } from "@/lib/models"
import type { DocRelationFile } from "@/lib/types"

/**
 * リレーションファイル
 */
export class DocRelationFileValue {
  constructor(private readonly value: DocRelationFile) {
    zDocRelationFile.parse(value)
    Object.freeze(this)
  }

  /**
   * ファイル名（拡張子なし）
   */
  get fileName() {
    return this.value.value
  }

  /**
   * 表示用ラベル
   */
  get label() {
    return this.value.label
  }

  /**
   * ファイルパス
   */
  get path() {
    return this.value.path
  }

  /**
   * 表示名を取得（ラベルが空の場合はファイル名）
   */
  get displayName() {
    return this.label || this.fileName
  }

  /**
   * ファイルパスとタイトルから生成
   */
  static from(filePath: string, title: string | null): DocRelationFileValue {
    const fileName = DocRelationFileValue.extractFileName(filePath)
    return new DocRelationFileValue({
      value: fileName,
      label: title || fileName,
      path: filePath,
    })
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
