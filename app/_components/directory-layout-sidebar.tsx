"use client"
import { DirectoryFileTreeNode } from "@/app/_components/directory-file-tree-node"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarProvider,
} from "@/app/_components/ui/sidebar"
import type { FileNode } from "@/lib/get-docs-files"
import { useSuspenseQuery } from "@tanstack/react-query"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type Props = {
  children: React.ReactNode
}

export function DirectoryLayoutSidebar(props: Props) {
  const [isClient, setIsClient] = useState(false)

  const [openPaths, setOpenPaths] = useState<Set<string>>(new Set())

  const [selectedDirectory, setSelectedDirectory] = useState<string>("")

  const router = useRouter()

  const path = usePathname()

  const { data } = useSuspenseQuery({
    queryKey: ["file-tree"],
    queryFn: async () => {
      const response = await fetch("/api/files/tree")
      if (!response.ok) {
        throw new Error("Failed to fetch file tree")
      }
      return response.json()
    },
  })
  const files = data.files

  function getCurrentPath(path: string) {
    // /directories/ から始まるパスの場合（標準的なディレクトリ表示）
    if (path.startsWith("/directories")) {
      const dirPath = path.replace("/directories", "")

      // パスを分解して各セグメントを確認
      const pathSegments = dirPath.split("/").filter(Boolean)

      // 最後のセグメントがファイル名かチェック（ドットを含むか）
      if (pathSegments.length > 0) {
        const lastSegment = pathSegments[pathSegments.length - 1]
        if (lastSegment === undefined) {
          throw new Error("Last segment is undefined")
        }
        const isFile = lastSegment.includes(".")

        if (isFile) {
          // ファイル名を除外してディレクトリパスを取得
          pathSegments.pop()
          return `/${pathSegments.join("/")}`
        }
      }

      return dirPath
    }

    // その他のパスの場合はそのまま返す
    return path
  }

  // 現在のパスをディレクトリパスに変換
  // ファイルパスもディレクトリパスとして扱えるように処理
  getCurrentPath(path)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // ファイルが変更された時に全ディレクトリを開く
  useEffect(() => {
    const collectAllDirectoryPaths = (nodes: FileNode[]): string[] => {
      const paths: string[] = []
      for (const node of nodes) {
        if (node.type === "directory") {
          const nodePath = node.path.replace(/^docs\//, "")
          paths.push(nodePath)
          if (node.children) {
            paths.push(...collectAllDirectoryPaths(node.children))
          }
        }
      }
      return paths
    }

    const allPaths = collectAllDirectoryPaths(files)
    setOpenPaths(new Set(allPaths))
  }, [files])

  // パスが変更された時に選択ディレクトリを更新
  useEffect(() => {
    // getCurrentPath関数をuseEffect内で定義
    const getCurrentDirectoryFromPath = (pathname: string) => {
      if (pathname.startsWith("/directories")) {
        const dirPath = pathname.replace("/directories", "")
        const pathSegments = dirPath.split("/").filter(Boolean)

        if (pathSegments.length > 0) {
          const lastSegment = pathSegments[pathSegments.length - 1]
          if (lastSegment?.includes(".")) {
            pathSegments.pop()
            return `/${pathSegments.join("/")}`
          }
        }
        return dirPath
      }
      return pathname
    }

    const currentDir = getCurrentDirectoryFromPath(path)
    const cleanDir = currentDir.startsWith("/")
      ? currentDir.substring(1)
      : currentDir
    setSelectedDirectory(cleanDir)
  }, [path])

  const handleSelectDirectory = (path: string) => {
    setSelectedDirectory(path)
    router.push(`/directories/${path}`)
  }

  const handleToggleOpen = (path: string) => {
    const newOpenPaths = new Set(openPaths)
    if (newOpenPaths.has(path)) {
      newOpenPaths.delete(path)
    } else {
      newOpenPaths.add(path)
    }
    setOpenPaths(newOpenPaths)
  }

  // 再帰的に全てのディレクトリを表示する関数
  const renderAllDirectories = (nodes: FileNode[], currentDepth = 0) => {
    return nodes.map((node) => (
      <DirectoryFileTreeNode
        key={node.path || `file-${node.name}`}
        node={node}
        depth={currentDepth}
        currentPath={
          window.location.pathname.match(/\/directories\/(.*)$/)?.[1] || ""
        }
        onSelectDirectory={handleSelectDirectory}
        openPaths={openPaths}
        onToggleOpen={handleToggleOpen}
        selectedDirectory={selectedDirectory}
      />
    ))
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible={"offcanvas"} variant={"inset"}>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{"ファイル"}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isClient && renderAllDirectories(files)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
      <SidebarInset>{props.children}</SidebarInset>
    </SidebarProvider>
  )
}
