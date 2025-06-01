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
import { useSuspenseQuery } from "@tanstack/react-query"
import { Fragment, useEffect, useState } from "react"

type Props = {
  children: React.ReactNode
}

export function FilesLayoutSidebar(props: Props) {
  const [isClient, setIsClient] = useState(false)

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
                    {files.map((file: FileNode) => (
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
