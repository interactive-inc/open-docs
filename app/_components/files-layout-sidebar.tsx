"use client"
import { FileTreeNode } from "@/app/_components/file-tree-node"
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
import { Fragment, useEffect, useState } from "react"

type Props = {
  files: FileNode[]
  children: React.ReactNode
}

export function FilesLayoutSidebar(props: Props) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

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
                    {props.files.map((file) => (
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
