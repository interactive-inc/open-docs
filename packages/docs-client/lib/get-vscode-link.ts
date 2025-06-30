/**
 * ファイルパスからVSCodeのリンクを生成する関数
 * @param fullPath 絶対パス
 */
export function getVSCodeFileLink(fullPath: string): string {
  return `vscode://file${fullPath}`
}
