/**
 * VSCodeのリンクを生成する関数
 */
export function getVSCodeLink(id: string, cwd: string): string {
  return `vscode://file/${cwd}/docs/products/client/features/${id}.md`
}
