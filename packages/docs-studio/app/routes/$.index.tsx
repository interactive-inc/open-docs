import type { DocTreeNode } from "@interactive-inc/docs-client"
import { createFileRoute, useLocation } from "@tanstack/react-router"
import { useContext } from "react"
import { DirectoryPageView } from "@/components/directory-page-view"
import { FilePageView } from "@/components/file-view/file-page-view"
import { RootStateContext } from "@/contexts/root-state"

export const Route = createFileRoute("/$/")({
  component: Component,
})

/**
 * ツリーから指定されたパスのノードを検索する
 */
function findNodeInTree(
  tree: DocTreeNode[],
  targetPath: string,
): DocTreeNode | null {
  for (const node of tree) {
    if (node.path === targetPath) {
      return node
    }
    if (node.type === "directory" && node.children) {
      const found = findNodeInTree(node.children, targetPath)
      if (found) return found
    }
  }
  return null
}

function Component() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const rootStateQuery = useContext(RootStateContext)

  if (pathname.startsWith("/apps")) {
    return null
  }

  const filePath = pathname.replace("/", "")

  // ツリーから現在のパスのノードを検索
  const tree = rootStateQuery.data
  const node = findNodeInTree(tree, filePath)

  // ツリーにノードが存在し、ファイルタイプの場合
  if (node && node.type === "file") {
    return <FilePageView filePath={filePath} />
  }

  // デフォルトはディレクトリとして表示
  return <DirectoryPageView key={pathname} currentPath={filePath} />
}
