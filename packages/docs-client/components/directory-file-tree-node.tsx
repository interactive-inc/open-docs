import { Link } from "@tanstack/react-router"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import type { DocFileNode } from "@/lib/types"
import { normalizePath, getDirectoryPath } from "@/lib/path-utils"
import { FileTreeIcon } from "./file-tree-icon"

type Props = {
  node: {
    type: 'file' | 'directory'
    name: string
    path: string
    icon?: string
    title?: string
    children?: unknown[]
  }
  depth?: number
  currentPath?: string
  onSelectDirectory?: (path: string) => void
  openPaths?: Set<string>
  onToggleOpen?: (path: string) => void
  selectedDirectory?: string
}

export function DirectoryFileTreeNode(props: Props) {
  const node = props.node
  const isDirectory = node.type === "directory"


  const depth = props.depth || 0
  const isOpen = props.openPaths?.has(normalizePath(node.path)) ?? false

  if (isDirectory) {
    const isSelected = props.selectedDirectory === normalizePath(node.path)
    const handleClick = (e: React.MouseEvent) => {
      if (props.onSelectDirectory) {
        e.preventDefault()
        props.onSelectDirectory(normalizePath(node.path))
      }
    }

    return (
      <>
        <SidebarMenuItem>
          <SidebarMenuButton
            style={{ paddingLeft: 8 + depth * 8 }}
            className={isSelected ? "bg-sidebar-accent font-medium" : ""}
            onClick={handleClick}
          >
            {node.icon && (
              <span className="text-base">{node.icon}</span>
            )}
            <span>{node.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {isOpen &&
          node.children &&
          node.children
            .filter((child: unknown): child is typeof node => 
              typeof child === 'object' && 
              child !== null && 
              'type' in child && 
              (child as typeof node).type === "directory"
            )
            .map((child) => (
              <DirectoryFileTreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                currentPath={props.currentPath}
                onSelectDirectory={props.onSelectDirectory}
                openPaths={props.openPaths}
                onToggleOpen={props.onToggleOpen}
                selectedDirectory={props.selectedDirectory}
              />
            ))}
      </>
    )
  }

  const formattedParentPath = getDirectoryPath(node.path)

  if (props.selectedDirectory !== formattedParentPath) {
    return null
  }

  return (
    <Link to="/$" params={{ _splat: normalizePath(node.path) }}>
      <SidebarMenuItem>
        <SidebarMenuButton style={{ paddingLeft: 8 + depth * 8 }}>
          <FileTreeIcon fileName={node.name} />
          {node.title !== node.name ? `${node.title} | ${node.name}` : node.name}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </Link>
  )
}
