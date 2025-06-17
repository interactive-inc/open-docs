import { zDocDirectory } from "@/lib/models"
import type { DocDirectory, DocRelation } from "@/lib/types"

/**
 * ディレクトリとその内容を表現するEntity
 */
export class DocDirectoryEntity {
  constructor(readonly value: DocDirectory) {
    // zDocDirectoryで検証
    zDocDirectory.parse(value)
    Object.freeze(this)
  }

  /**
   * インデックスファイルを取得
   */
  get indexFile() {
    return this.value.indexFile
  }

  /**
   * ファイル一覧を取得
   */
  get files() {
    return this.value.files
  }

  /**
   * その他のファイル一覧を取得
   */
  get otherFiles() {
    return this.value.otherFiles
  }

  /**
   * アーカイブされたファイル一覧を取得
   */
  get archivedFiles() {
    return this.value.archivedFiles
  }

  /**
   * Markdownファイルパス一覧を取得
   */
  get markdownFilePaths() {
    return this.value.markdownFilePaths
  }

  /**
   * リレーション情報を取得
   */
  get relations(): DocRelation[] {
    return this.value.relations
  }

  /**
   * アーカイブの有無を取得
   */
  get hasArchive() {
    return this.value.hasArchive
  }

  /**
   * アーカイブファイル数を取得
   */
  get archiveFileCount() {
    return this.value.archiveFileCount
  }

  /**
   * カレントワーキングディレクトリを取得
   */
  get cwd() {
    return this.value.cwd
  }

  /**
   * JSON形式に変換
   */
  public toJson(): DocDirectory {
    return this.value
  }
}
