"use client"
import { DirectoryFileTreeNode } from "@/app/_components/directory-file-tree-node"
import { Button } from "@/app/_components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarProvider,
} from "@/app/_components/ui/sidebar"
import type { FileNode } from "@/lib/get-docs-files"
import { ArrowLeftIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Fragment, useEffect, useState } from "react"

type Props = {
  files: FileNode[]
  children: React.ReactNode
}

export function DirectoryLayoutSidebar(props: Props) {
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const path = usePathname()

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
  const currentDirectoryPath = getCurrentPath(path)

  console.log("currentDirectoryPath", currentDirectoryPath)

  // 現在のパスに基づいてディレクトリの内容を取得する関数
  const getCurrentDirectoryContents = (
    files: FileNode[],
    dirPath: string,
  ): FileNode[] => {
    // パスが空の場合は全ファイルを返す
    if (!dirPath || dirPath === "/") {
      return files
    }

    // パスの処理（先頭の/を削除）
    const cleanPath = dirPath.startsWith("/") ? dirPath.substring(1) : dirPath
    const parts = cleanPath.split("/").filter(Boolean)

    // トップレベルから順に探していく
    let currentLevel = files

    for (const part of parts) {
      // 現在の階層から該当するディレクトリを探す
      const directory = currentLevel.find(
        (item) => item.type === "directory" && item.name === part,
      )

      // ディレクトリが見つからないか、子要素がない場合は全ファイルを返す
      if (!directory || !directory.children) {
        return files
      }

      // 次の階層へ進む
      currentLevel = directory.children
    }

    // 見つかったディレクトリの子要素を返す
    return currentLevel
  }

  // 現在のパスに基づいて表示するファイルツリーを取得
  const getFileTree = () => {
    if (!isClient) return props.files

    // パスの処理（先頭の/を削除）
    const cleanPath = currentDirectoryPath.startsWith("/")
      ? currentDirectoryPath.substring(1)
      : currentDirectoryPath

    return getCurrentDirectoryContents(props.files, cleanPath)
  }

  const fileTree = getFileTree()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleGoBack = () => {
    router.back()
  }

  // パスの階層構造を取得する関数
  const getPathHierarchy = (path: string): { name: string; path: string }[] => {
    // /directories のパスを除去
    const dirPath = path.startsWith("/directories")
      ? path.replace("/directories", "")
      : path

    // パスが空または "/" の場合は空の配列を返す
    if (!dirPath || dirPath === "/") {
      return []
    }

    // 先頭の / を削除してセグメントに分割
    const cleanPath = dirPath.startsWith("/") ? dirPath.substring(1) : dirPath
    const segments = cleanPath.split("/").filter(Boolean)

    // 階層ごとのパスを構築
    const result: { name: string; path: string }[] = []
    let currentPath = ""

    // ルートディレクトリを追加
    result.push({ name: "ルート", path: "" })

    // 各階層を追加
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      if (!segment) continue // segmentがundefinedの場合はスキップ

      currentPath = currentPath ? `${currentPath}/${segment}` : segment

      // 最後のセグメントがファイルかチェック
      if (i === segments.length - 1 && segment.includes(".")) {
        continue // ファイル名はスキップ
      }

      result.push({
        name: segment,
        path: currentPath,
      })
    }

    return result
  }

  const pathHierarchy = getPathHierarchy(path)

  const handleSelectDirectory = (path: string) => {
    router.push(`/directories/${path}`)
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible={"offcanvas"} variant={"inset"}>
        <SidebarHeader>
          <div className="flex flex-col space-y-2">
            {pathHierarchy.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                {pathHierarchy.map((item, index) => (
                  <Button
                    key={item.path}
                    size={"sm"}
                    variant={"secondary"}
                    className="flex justify-start"
                    onClick={() => handleSelectDirectory(item.path)}
                  >
                    {index !== pathHierarchy.length - 1 && (
                      <ArrowLeftIcon size={16} />
                    )}
                    <span>{item.name}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{"ファイル"}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isClient && (
                  <Fragment>
                    {fileTree.map((file: FileNode) => (
                      <DirectoryFileTreeNode
                        key={file.path || `file-${file.name}`}
                        node={file}
                        currentPath={
                          window.location.pathname.match(
                            /\/directories\/(.*)$/,
                          )?.[1] || ""
                        }
                        onSelectDirectory={handleSelectDirectory}
                      />
                    ))}
                  </Fragment>
                )}
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
