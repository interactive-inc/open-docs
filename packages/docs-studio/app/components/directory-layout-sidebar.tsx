import type { DocTreeFileNode, DocTreeNode } from "@interactive-inc/docs-client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { DirectoryFileTreeNode } from "@/components/directory-file-tree-node"
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
} from "@/components/ui/sidebar"
import { apiClient } from "@/lib/api-client"
import { normalizePath } from "@/lib/path-utils"

function _isFileNode(node: DocTreeNode): node is DocTreeFileNode {
  return (
    typeof node === "object" &&
    node !== null &&
    "type" in node &&
    "name" in node &&
    "path" in node
  )
}

type Props = {
  children: React.ReactNode
}

export function DirectoryLayoutSidebar(props: Props) {
  const [openPaths, setOpenPaths] = useState<Set<string>>(new Set())

  const [selectedDirectory, setSelectedDirectory] = useState<string>("")

  const navigate = useNavigate()

  const path = useLocation({ select: (location) => location.pathname })

  const query = useSuspenseQuery({
    queryKey: [apiClient.api.directories.tree.$url()],
    queryFn: async () => {
      const resp = await apiClient.api.directories.tree.$get()
      return resp.json()
    },
  })

  const treeNodes: DocTreeNode[] = query.data

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
    const collectAllDirectoryPaths = (nodes: DocTreeNode[]): string[] => {
      const paths: string[] = []
      for (const node of nodes) {
        if (node.type !== "directory") continue
        const nodePath = normalizePath(node.path)
        paths.push(nodePath)
        if (node.children) {
          paths.push(...collectAllDirectoryPaths(node.children))
        }
      }
      return paths
    }

    const allPaths = collectAllDirectoryPaths(treeNodes)
    setOpenPaths(new Set(allPaths))
  }, [treeNodes])

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
    navigate({ to: `/${path}` })
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

  const directoryNodes = treeNodes.filter((node) => {
    return node.type === "directory"
  })

  const currentPath = window.location.pathname.match(/\/(.*)$/)?.[1] || ""

  return (
    <SidebarProvider>
      <Sidebar collapsible={"offcanvas"} variant={"inset"}>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{"ファイル"}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {directoryNodes.map((node) => (
                  <DirectoryFileTreeNode
                    key={node.path || `file-${node.name}`}
                    node={node}
                    depth={0}
                    currentPath={currentPath}
                    onSelectDirectory={handleSelectDirectory}
                    onToggleOpen={handleToggleOpen}
                    selectedDirectory={selectedDirectory}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
      <SidebarInset className="overflow-hidden">{props.children}</SidebarInset>
    </SidebarProvider>
  )
}
