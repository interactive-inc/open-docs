import type { DocPathSystem } from "../doc-path-system"
import { zDocFilePath } from "../models"
import type { DocFilePath } from "../types"

/**
 * ファイルパス情報の値オブジェクト
 */
export class DocFilePathValue {
  private readonly pathSystem: DocPathSystem

  constructor(
    readonly value: DocFilePath,
    pathSystem: DocPathSystem,
  ) {
    zDocFilePath.parse(value)
    this.pathSystem = pathSystem
    Object.freeze(this)
  }

  /**
   * ファイル名（拡張子なし）
   */
  get name(): string {
    return this.value.name
  }

  /**
   * ファイルパス（相対パス）
   */
  get path(): string {
    return this.value.path
  }

  /**
   * ファイル名（拡張子付き）
   */
  get nameWithExtension(): string {
    return this.value.nameWithExtension
  }

  /**
   * フルパス（絶対パス）
   */
  get fullPath(): string {
    return this.value.fullPath
  }

  /**
   * ディレクトリパス
   */
  get directoryPath(): string {
    return this.pathSystem.dirname(this.path)
  }

  /**
   * 拡張子
   */
  get extension(): string {
    return this.pathSystem.extname(this.nameWithExtension)
  }

  /**
   * アーカイブされているかどうか
   */
  get isArchived(): boolean {
    return this.path.includes("/.archive/")
  }

  /**
   * 相対パスからインスタンスを生成（DI対応）
   */
  static fromPathWithSystem(
    filePath: string,
    pathSystem: DocPathSystem,
    basePath?: string,
  ): DocFilePathValue {
    const nameWithExtension = pathSystem.basename(filePath)
    let name = pathSystem.basename(filePath, pathSystem.extname(filePath))

    // index.mdの場合は親ディレクトリ名を使用
    if (name === "index" && filePath.includes("/")) {
      const parentDir = pathSystem.dirname(filePath)
      name = pathSystem.basename(parentDir)
    }

    const fullPath = basePath
      ? pathSystem.join(basePath, filePath)
      : pathSystem.resolve(filePath)

    return new DocFilePathValue(
      {
        name,
        path: filePath,
        fullPath,
        nameWithExtension,
      },
      pathSystem,
    )
  }

  /**
   * JSON形式で出力
   */
  toJson(): DocFilePath {
    return this.value
  }
}
