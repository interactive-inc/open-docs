"use client"

import type { vPage } from "../../lib/models/page"

export type TreeNodeType = {
  pages: Array<ReturnType<typeof vPage.parse>>
  children: Record<string, TreeNodeType>
}

type Props = {
  node: TreeNodeType
  path: string
  depth: number
  selectedPageId: string | null
  onSelectPage: (pageId: string) => void
}

export function TreeNode(props: Props) {
  const nodePages = props.node.pages || []
  const children = props.node.children || {}
  const childKeys = Object.keys(children)

  return (
    <div className="ml-4">
      {nodePages.map((page) => (
        <button
          key={page.id}
          type="button"
          className={`my-1 w-full cursor-pointer rounded-md px-3 py-2 text-left transition-colors hover:bg-gray-100 ${
            props.selectedPageId === page.id ? "bg-blue-100" : ""
          }`}
          onClick={() => props.onSelectPage(page.id)}
          aria-pressed={props.selectedPageId === page.id}
        >
          <div className="font-medium">{page.name}</div>
          <div className="text-gray-500 text-xs">{page.path}</div>
        </button>
      ))}

      {childKeys.length > 0 && (
        <div className="mt-1 ml-2 border-gray-200 border-l-2 pl-2">
          {childKeys.map((key) => {
            const childPath =
              props.path === "/" ? `/${key}` : `${props.path}/${key}`
            const childNode = children[key]

            // 子ノードが存在する場合のみレンダリング
            if (childNode) {
              return (
                <div key={childPath} className="mb-2">
                  <div className="mt-2 font-medium text-gray-700">{key}</div>
                  <TreeNode
                    node={childNode}
                    path={childPath}
                    depth={props.depth + 1}
                    selectedPageId={props.selectedPageId}
                    onSelectPage={props.onSelectPage}
                  />
                </div>
              )
            }
            return null
          })}
        </div>
      )}
    </div>
  )
}
