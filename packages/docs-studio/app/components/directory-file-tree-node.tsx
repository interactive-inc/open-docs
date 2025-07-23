import type { DocTreeDirectoryNode } from "@interactive-inc/docs-client"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

type Props = {
  node: DocTreeDirectoryNode
  depth?: number
  currentPath?: string
  onSelectDirectory(path: string): void
  openPaths?: Set<string>
  onToggleOpen?: (path: string) => void
  selectedDirectory?: string
}

export function DirectoryFileTreeNode(props: Props) {
  const node = props.node

  const depth = props.depth || 0

  const isSelected = props.selectedDirectory === node.path

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    props.onSelectDirectory(node.path)
  }

  const children = node.children.filter((node) => {
    return node.type === "directory"
  })

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          style={{ paddingLeft: 8 + depth * 8 }}
          className={isSelected ? "bg-sidebar-accent font-medium" : ""}
          onClick={onClick}
        >
          {node.icon && <span className="text-base">{node.icon}</span>}
          <span>{node.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      {children.map((child) => (
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
