/**
 * ファイルパスからVSCodeのリンクを生成する関数
 */
export function getVSCodeFileLink(filePath: string, cwd: string): string {
  // 絶対パスの場合はそのまま使用、相対パスの場合はcwdと結合
  if (filePath.startsWith("/")) {
    return `vscode://file${filePath}`
  }

  return `vscode://file/${cwd}/${filePath}`
}
