/**
 * パスを正規化（絶対パスから相対パスに変換）
 */
export function normalizePath(rawPath: string): string {
  let currentPath = rawPath

  // 絶対パスの場合、相対パスに変換
  if (currentPath.includes("/docs/")) {
    const docsIndex = currentPath.lastIndexOf("/docs/")
    currentPath = currentPath.substring(docsIndex + 6) // '/docs/'.length = 6
  }

  // docsプレフィックスを削除
  currentPath = currentPath.replace(/^docs\//, "")

  // 先頭のスラッシュを削除
  currentPath = currentPath.replace(/^\/+/, "")

  return currentPath
}
