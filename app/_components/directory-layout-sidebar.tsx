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
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from "@/app/_components/ui/sidebar"
import { apiClient } from "@/lib/api-client"
import type { FileNode } from "@/system/routes/files.tree"
import { useSuspenseQuery } from "@tanstack/react-query"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type Props = {
  children: React.ReactNode
}

export function DirectoryLayoutSidebar(props: Props) {
  const [openPaths, setOpenPaths] = useState<Set<string>>(new Set())

  const [selectedDirectory, setSelectedDirectory] = useState<string>("")

  const router = useRouter()

  const path = usePathname()

  const query = useSuspenseQuery({
    queryKey: ["file-tree"],
    queryFn: async () => {
      const response = await apiClient.api.files.tree.$get()
      return response.json()
    },
  })

  const files = query.data.files

  function getCurrentPath(path: string) {
    const dirPath = path

    const pathSegments = dirPath.split("/").filter(Boolean)

    if (pathSegments.length > 0) {
      const lastSegment = pathSegments[pathSegments.length - 1]
      if (lastSegment === undefined) {
        throw new Error("Last segment is undefined")
      }
      const isFile = lastSegment.includes(".")

      if (isFile) {
        pathSegments.pop()
        return `/${pathSegments.join("/")}`
      }
    }

    return dirPath
  }

  getCurrentPath(path)

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

  useEffect(() => {
    const getCurrentDirectoryFromPath = (pathname: string) => {
      const dirPath = pathname
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

    const currentDir = getCurrentDirectoryFromPath(path)
    const cleanDir = currentDir.startsWith("/")
      ? currentDir.substring(1)
      : currentDir
    setSelectedDirectory(cleanDir)
  }, [path])

  const handleSelectDirectory = (path: string) => {
    setSelectedDirectory(path)
    router.push(`/${path}`)
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

  const renderAllDirectories = (nodes: FileNode[], currentDepth = 0) => {
    return nodes.map((node) => (
      <DirectoryFileTreeNode
        key={node.path || `file-${node.name}`}
        node={node}
        depth={currentDepth}
        currentPath={window.location.pathname.match(/\/(.*)$/)?.[1] || ""}
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
            <SidebarGroupContent>
              <SidebarMenu>
                <div className="flex gap-2">
                  <SidebarMenuItem>
                    <Link href={"/"}>
                      <Button
                        className="w-full justify-start"
                        variant={"secondary"}
                        size={"sm"}
                      >
                        {"ホーム"}
                      </Button>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href={"/app/client"}>
                      <Button
                        className="w-full justify-start"
                        variant={"secondary"}
                        size={"sm"}
                      >
                        {"実験"}
                      </Button>
                    </Link>
                  </SidebarMenuItem>
                </div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>{"ファイル"}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderAllDirectories(files)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
      <SidebarInset className="overflow-hidden">{props.children}</SidebarInset>
    </SidebarProvider>
  )
}
