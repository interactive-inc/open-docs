import type { DocPathSystem } from "../doc-path-system"
import { DocFilePathValue } from "./doc-file-path-value"

type DocDirectoryPath = {
  path: string
  name: string
  fullPath: string
}

/**
 * ディレクトリパスを表す値オブジェクト
 */
export class DocDirectoryPathValue {
  private readonly pathSystem: DocPathSystem

  constructor(
    private readonly value: DocDirectoryPath,
    pathSystem: DocPathSystem,
  ) {
    this.pathSystem = pathSystem
    Object.freeze(this)
  }

  /**
   * 相対ディレクトリパス
   */
  get path(): string {
    return this.value.path
  }

  /**
   * ディレクトリ名
   */
  get name(): string {
    return this.value.name
  }

  /**
   * 親ディレクトリパスを取得
   */
  get parent(): DocDirectoryPathValue | null {
    if (this.path === "." || this.path === "") {
      return null
    }
    const parentPath = this.pathSystem.dirname(this.path)
    const parentName =
      parentPath === "." ? "" : this.pathSystem.basename(parentPath)
    return new DocDirectoryPathValue(
      {
        path: parentPath,
        name: parentName,
        fullPath: this.pathSystem.dirname(this.fullPath),
      },
      this.pathSystem,
    )
  }

  /**
   * 親ディレクトリパス
   */
  get parentPath(): string {
    return this.pathSystem.dirname(this.path)
  }

  /**
   * 深さ（ディレクトリの階層数）
   */
  get depth(): number {
    if (this.path === "." || this.path === "") {
      return 0
    }
    return this.path.split(this.pathSystem.sep).filter(Boolean).length
  }

  /**
   * パスセグメント（ディレクトリの配列）
   */
  get segments(): string[] {
    return this.path.split(this.pathSystem.sep).filter(Boolean)
  }

  /**
   * ルートからの相対パス（先頭のスラッシュなし）
   */
  get normalizedPath(): string {
    return this.path.replace(/^\/+/, "")
  }

  /**
   * アーカイブディレクトリかどうか（ディレクトリ名が「_」の場合）
   */
  get isArchived(): boolean {
    return this.name === "_"
  }

  /**
   * 隠しディレクトリかどうか
   */
  get isHidden(): boolean {
    return this.name.startsWith(".")
  }

  /**
   * ルートディレクトリかどうか
   */
  get isRoot(): boolean {
    return this.path === "." || this.path === ""
  }

  /**
   * 絶対パス
   */
  get fullPath(): string {
    return this.value.fullPath
  }

  /**
   * インデックスファイルのパスを取得
   */
  get indexFile(): DocFilePathValue {
    return DocFilePathValue.fromPathWithSystem(
      this.pathSystem.join(this.path, "index.md"),
      this.pathSystem,
      this.pathSystem.dirname(this.fullPath),
    )
  }

  /**
   * ファイルパスを作成
   */
  file(fileName: string): DocFilePathValue {
    return DocFilePathValue.fromPathWithSystem(
      this.pathSystem.join(this.path, fileName),
      this.pathSystem,
      this.pathSystem.dirname(this.fullPath),
    )
  }

  /**
   * サブディレクトリのパスを作成
   */
  subdirectory(dirName: string): DocDirectoryPathValue {
    const subPath = this.pathSystem.join(this.path, dirName)
    return new DocDirectoryPathValue(
      {
        path: subPath,
        name: dirName,
        fullPath: this.pathSystem.join(this.fullPath, dirName),
      },
      this.pathSystem,
    )
  }

  /**
   * 相対パスからインスタンスを生成（DI対応）
   */
  static fromPathWithSystem(
    dirPath: string,
    basePath: string,
    pathSystem: DocPathSystem,
  ): DocDirectoryPathValue {
    const name = dirPath === "." ? "" : pathSystem.basename(dirPath)
    const fullPath =
      dirPath === "." ? basePath : pathSystem.join(basePath, dirPath)

    return new DocDirectoryPathValue(
      {
        path: dirPath,
        name,
        fullPath,
      },
      pathSystem,
    )
  }

  /**
   * JSON形式で出力
   */
  toJson(): DocDirectoryPath {
    return this.value
  }

  /**
   * パスが等しいかどうか
   */
  equals(other: DocDirectoryPathValue): boolean {
    return this.path === other.path
  }

  /**
   * 指定されたディレクトリがこのディレクトリの子孫かどうか
   */
  contains(other: DocDirectoryPathValue): boolean {
    const relative = this.pathSystem.relative(this.path, other.path)
    return !relative.startsWith("..") && relative !== ""
  }
}
