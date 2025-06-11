"use client"

import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/_components/ui/sidebar"
import type { FileNode } from "@/lib/types"
import Link from "next/link"
import { FileTreeIcon } from "./file-tree-icon"

type Props = {
  node: FileNode
  depth?: number
  currentPath?: string
  onSelectDirectory?: (path: string) => void
  openPaths?: Set<string>
  onToggleOpen?: (path: string) => void
  selectedDirectory?: string
}

export function DirectoryFileTreeNode(props: Props) {
  const isDirectory = props.node.type === "directory"

  const formatPath = (path: string) => {
    // "docs/" を取り除く
    return path.replace(/^docs\//, "")
  }

  const depth = props.depth || 0
  const isOpen = props.openPaths?.has(formatPath(props.node.path)) ?? false

  if (isDirectory) {
    const isSelected = props.selectedDirectory === formatPath(props.node.path)
    const handleClick = (e: React.MouseEvent) => {
      if (props.onSelectDirectory) {
        e.preventDefault()
        props.onSelectDirectory(formatPath(props.node.path))
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
            {props.node.icon && (
              <span className="text-base">{props.node.icon}</span>
            )}
            <span>{props.node.name}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {isOpen &&
          props.node.children &&
          props.node.children
            .filter((child: FileNode) => child.type === "directory")
            .map((child: FileNode) => (
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

  // ファイルは選択されたディレクトリの直下にある場合のみ表示
  const parentPath = props.node.path.substring(
    0,
    props.node.path.lastIndexOf("/"),
  )
  const formattedParentPath = parentPath.replace(/^docs\/?/, "")

  if (props.selectedDirectory !== formattedParentPath) {
    return null
  }

  return (
    <Link href={`/${formatPath(props.node.path)}`}>
      <SidebarMenuItem>
        <SidebarMenuButton style={{ paddingLeft: 8 + depth * 8 }}>
          <FileTreeIcon fileName={props.node.name} />
          {props.node.name}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </Link>
  )
}
