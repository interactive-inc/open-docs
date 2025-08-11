/**
 * パスを正規化してルーティング用のパスに変換
 * 先頭のスラッシュを削除
 */
export function normalizePath(path: string): string {
  return path.startsWith("/") ? path.substring(1) : path
}

/**
 * パスからディレクトリ部分を取得
 */
export function getDirectoryPath(path: string): string {
  const lastSlash = path.lastIndexOf("/")
  return lastSlash > 0 ? path.substring(0, lastSlash) : ""
}

export function getCurrentPath() {
  return window.location.pathname.match(/\/(.*)$/)?.[1] || ""
}
