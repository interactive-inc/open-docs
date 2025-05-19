"use client"

import type { vPage } from "../../lib/models/page"
import { TreeNode, type TreeNodeType } from "./tree-node"

type Props = {
  pages: Array<ReturnType<typeof vPage.parse>>
  selectedPageId: string | null
  onSelectPage: (pageId: string) => void
}

export function PageTreeView(props: Props) {
  // ページパスをセグメントに分解してネストされたオブジェクトを作成
  function buildPathTree() {
    const tree: Record<string, TreeNodeType> = {}

    // 最初は「/」を作成
    tree["/"] = { pages: [], children: {} }

    // 各ページをツリーに追加
    for (const page of props.pages) {
      if (page.path === "/") {
        tree["/"].pages.push(page)
        continue
      }

      const segments = page.path.split("/").filter(Boolean)
      let currentLevel = tree["/"]

      // 各セグメントをたどってツリーを構築
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]
        const isLastSegment = i === segments.length - 1

        // このレベルのパスがまだ存在しない場合は作成
        // 型安全性のために、segmentが存在することを確認
        if (segment && !currentLevel.children[segment]) {
          currentLevel.children[segment] = {
            pages: [],
            children: {},
          }
        }

        // 最後のセグメントならページを追加
        if (isLastSegment && segment && currentLevel.children[segment]) {
          currentLevel.children[segment].pages.push(page)
        }

        // 型安全性のために、segmentが存在することを確認
        if (segment && currentLevel.children[segment]) {
          currentLevel = currentLevel.children[segment]
        }
      }
    }

    return tree
  }

  const tree = buildPathTree()
  const rootNode = tree["/"]

  return (
    <div className="h-full">
      <h2 className="mb-4 font-bold text-xl">サイトマップ</h2>
      {rootNode && (
        <TreeNode
          node={rootNode}
          path="/"
          depth={0}
          selectedPageId={props.selectedPageId}
          onSelectPage={props.onSelectPage}
        />
      )}
    </div>
  )
}
