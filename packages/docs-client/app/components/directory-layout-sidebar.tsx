import { useSuspenseQuery } from "@tanstack/react-query"
import {
  Link,
  useLocation,
  useNavigate,
  useRouter,
} from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { DirectoryFileTreeNode } from "@/components/directory-file-tree-node"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/sidebar"
import { apiClient } from "@/lib/api-client"
import { normalizePath } from "@/lib/path-utils"
import type { DocFileNode } from "@/lib/types"

type FileNode = {
  type: 'file' | 'directory'
  name: string
  path: string
  icon?: string
  title?: string
  children?: unknown[]
}

function isFileNode(node: unknown): node is FileNode {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    'name' in node &&
    'path' in node
  )
}

type Props = {
  children: React.ReactNode
}

export function DirectoryLayoutSidebar(props: Props) {
  const [openPaths, setOpenPaths] = useState<Set<string>>(new Set())

  const [selectedDirectory, setSelectedDirectory] = useState<string>("")

  const _router = useRouter()

  const navigate = useNavigate()

  const path = useLocation({ select: (location) => location.pathname })

  const query = useSuspenseQuery({
    queryKey: ["file-tree"],
    queryFn: async () => {
      const response = await apiClient.api.directories.tree.$get()
      return response.json()
    },
  })

  const files = query.data

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
    const collectAllDirectoryPaths = (nodes: unknown[]): string[] => {
      const paths: string[] = []
      for (const node of nodes) {
        if (isFileNode(node) && node.type === "directory") {
          const nodePath = normalizePath(node.path)
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

  const renderAllDirectories = (nodes: unknown[], currentDepth = 0) => {
    return nodes.filter(isFileNode).map((node) => (
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
