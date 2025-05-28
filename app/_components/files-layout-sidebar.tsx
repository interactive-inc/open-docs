"use client"

import nodePath from "node:path"
import { moveFile } from "@/app/_actions/move-file"
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
import type { DragEndEvent } from "@dnd-kit/core"
import { Fragment, useEffect, useState } from "react"
import { FileTreeNode } from "@/app/_components/file-tree-node"

type Props = {
  files: FileNode[]
  children: React.ReactNode
}

export function FilesLayoutSidebar(props: Props) {
  const [fileTree, setFileTree] = useState(props.files)
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleDragEnd = async (event: DragEndEvent) => {
    const active = event.active
    const over = event.over

    // ドロップ先がない場合は何もしない
    if (!over) return

    const sourceNode = (active.data?.current as { node: FileNode })?.node
    const targetNode = (
      over.data?.current as { node: FileNode; isDirectory: boolean }
    )?.node
    const isTargetDirectory = (over.data?.current as { isDirectory: boolean })
      ?.isDirectory

    // 同じノードの場合は何もしない
    if (sourceNode.path === targetNode.path) return

    // ターゲットがディレクトリでない場合は何もしない
    if (!isTargetDirectory) return

    // ファイルパスの処理
    const sourceFileName = nodePath.basename(sourceNode.path)
    const destinationPath = nodePath.join(targetNode.path, sourceFileName)

    // ServerActionを呼び出してファイルを移動
    const result = await moveFile({
      sourcePath: sourceNode.path,
      destinationPath,
    })

    if (result.success) {
      // ファイル移動が成功した場合は、リロードするか状態を更新する
      // ここではシンプルにリダイレクトで対応
      window.location.reload()
    } else {
      console.error(result.message)
    }
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible={"offcanvas"} variant={"inset"}>
        <SidebarHeader />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{"ファイル"}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isClient && (
                  <Fragment>
                    {fileTree.map((file) => (
                      <FileTreeNode key={file.path} node={file} />
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
