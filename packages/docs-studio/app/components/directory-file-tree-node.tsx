import type { DocTreeDirectoryNode } from "@interactive-inc/docs-client"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

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
  const depth = props.depth || 0

  const isSelected = props.selectedDirectory === props.node.path

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    props.onSelectDirectory(props.node.path)
  }

  const children = props.node.children.filter((node) => {
    return node.type === "directory"
  })

  if (depth === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          className={cn("h-7", { "bg-sidebar-accent": isSelected })}
          onClick={onClick}
        >
          {props.node.icon && (
            <span className="text-base">{props.node.icon}</span>
          )}
          <span>{props.node.title}</span>
        </SidebarMenuButton>
        {children.length !== 0 && (
          <SidebarMenuSub>
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
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        className={cn({ "bg-sidebar-accent": isSelected })}
        onClick={onClick}
      >
        {props.node.icon && (
          <span className="text-base">{props.node.icon}</span>
        )}
        <span>{props.node.title}</span>
      </SidebarMenuSubButton>
      {children.length !== 0 && (
        <SidebarMenuSub>
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
        </SidebarMenuSub>
      )}
    </SidebarMenuSubItem>
  )
}
