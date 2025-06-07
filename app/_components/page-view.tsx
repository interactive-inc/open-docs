"use client"

import { DirectoryPageView } from "@/app/_components/directory-page-view"
import { FilePageView } from "@/app/_components/file-view/file-page-view"
import { apiClient } from "@/lib/api-client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

export function PageView() {
  const params = useParams<{ directories: string[] }>()

  const { data: fileTreeData } = useSuspenseQuery({
    queryKey: ["file-tree"],
    queryFn: async () => {
      const response = await apiClient.api.files.tree.$get()

      if (!response.ok) {
        throw new Error("Failed to fetch file tree")
      }

      return response.json()
    },
  })

  const currentPath = params.directories.join("/")

  // ファイルツリーからパスがファイルかディレクトリかを判定
  const findPathInTree = (
    nodes: typeof fileTreeData.files,
    targetPath: string,
  ): { isFile: boolean } | null => {
    for (const node of nodes) {
      // docs/プレフィックスを除去して比較
      const nodePath = node.path.replace(/^docs\//, "")
      if (nodePath === targetPath) {
        return { isFile: node.type === "file" }
      }
      if (node.children) {
        const result = findPathInTree(node.children, targetPath)
        if (result) return result
      }
    }
    return null
  }

  const pathInfo = findPathInTree(fileTreeData.files, currentPath)

  const isFile = pathInfo?.isFile || false

  if (isFile) {
    return <FilePageView filePath={currentPath} />
  }

  return <DirectoryPageView key={currentPath} currentPath={currentPath} />
}
