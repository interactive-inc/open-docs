import { useLocation, useNavigate } from "@tanstack/react-router"
import { useContext } from "react"
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
import { RootStateContext } from "@/contexts/root-state"

type Props = {
  children: React.ReactNode
}

export function DirectoryLayoutSidebar(props: Props) {
  const navigate = useNavigate()

  const location = useLocation()

  const rootStateQuery = useContext(RootStateContext)

  const getCurrentDirectory = () => {
    const pathname = location.pathname
    const pathSegments = pathname.split("/").filter(Boolean)
    if (pathSegments.length > 0) {
      const lastSegment = pathSegments[pathSegments.length - 1]
      if (lastSegment?.includes(".")) {
        pathSegments.pop()
      }
    }

    return pathSegments.join("/")
  }

  const selectedDirectory = getCurrentDirectory()

  const handleSelectDirectory = (path: string) => {
    navigate({ to: `/${path}` })
  }

  const directoryNodes = rootStateQuery.data.filter((node) => {
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
