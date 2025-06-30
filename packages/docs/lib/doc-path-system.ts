/**
 * パス操作システム
 */
export class DocPathSystem {
  private readonly separator = "/"

  /**
   * パスを結合
   */
  join(...paths: string[]): string {
    const parts: string[] = []

    for (const path of paths) {
      if (path === "") continue

      // セパレータで分割
      const segments = path.split(this.separator).filter(Boolean)
      parts.push(...segments)
    }

    // 空の場合は "." を返す
    if (parts.length === 0) {
      return "."
    }

    // 先頭が "/" で始まっていた場合は絶対パスとして扱う
    const isAbsolute = paths[0]?.startsWith(this.separator)
    const joined = parts.join(this.separator)

    return isAbsolute ? `${this.separator}${joined}` : joined
  }

  /**
   * ファイル名を取得（拡張子付き）
   */
  basename(path: string, ext?: string): string {
    const segments = path.split(this.separator)
    const filename = segments[segments.length - 1] || ""

    if (ext && filename.endsWith(ext)) {
      return filename.slice(0, -ext.length)
    }

    return filename
  }

  /**
   * ディレクトリ名を取得
   */
  dirname(path: string): string {
    const segments = path.split(this.separator)

    // ルートディレクトリの場合
    if (segments.length <= 1) {
      return "."
    }

    // 最後の要素を除いた部分を結合
    segments.pop()
    const dir = segments.join(this.separator)

    // 空の場合は "." を返す
    return dir || "."
  }

  /**
   * 拡張子を取得
   */
  extname(path: string): string {
    const basename = this.basename(path)
    const lastDot = basename.lastIndexOf(".")

    if (lastDot <= 0) {
      return ""
    }

    return basename.slice(lastDot)
  }

  /**
   * 相対パスを計算
   */
  relative(from: string, to: string): string {
    const fromSegments = from.split(this.separator).filter(Boolean)
    const toSegments = to.split(this.separator).filter(Boolean)

    // 共通の親ディレクトリを見つける
    let commonLength = 0
    for (let i = 0; i < Math.min(fromSegments.length, toSegments.length); i++) {
      if (fromSegments[i] === toSegments[i]) {
        commonLength++
      } else {
        break
      }
    }

    // fromから共通の親まで戻る
    const upCount = fromSegments.length - commonLength
    const upSegments = Array(upCount).fill("..")

    // 共通の親からtoへのパス
    const downSegments = toSegments.slice(commonLength)

    // 結合
    const segments = [...upSegments, ...downSegments]

    return segments.length > 0 ? segments.join(this.separator) : "."
  }

  /**
   * 絶対パスに変換
   */
  resolve(...paths: string[]): string {
    // 簡易実装：最後の絶対パスから開始、または現在のパスから開始
    let resolved = ""

    for (const path of paths) {
      if (path.startsWith(this.separator)) {
        // 絶対パスの場合はリセット
        resolved = path
      } else if (path !== "") {
        // 相対パスの場合は結合
        resolved = resolved ? this.join(resolved, path) : path
      }
    }

    return resolved || "."
  }

  /**
   * パスを正規化
   */
  normalize(path: string): string {
    const isAbsolute = path.startsWith(this.separator)
    const segments = path.split(this.separator).filter(Boolean)
    const normalized: string[] = []

    for (const segment of segments) {
      if (segment === "..") {
        // 親ディレクトリへ
        if (
          normalized.length > 0 &&
          normalized[normalized.length - 1] !== ".."
        ) {
          normalized.pop()
        } else if (!isAbsolute) {
          normalized.push("..")
        }
      } else if (segment !== ".") {
        // "." は無視、それ以外は追加
        normalized.push(segment)
      }
    }

    if (normalized.length === 0) {
      return isAbsolute ? this.separator : "."
    }

    const result = normalized.join(this.separator)
    return isAbsolute ? `${this.separator}${result}` : result
  }

  /**
   * パスが絶対パスかどうか
   */
  isAbsolute(path: string): boolean {
    return path.startsWith(this.separator)
  }

  /**
   * パスのセパレータ
   */
  get sep(): string {
    return this.separator
  }
}
