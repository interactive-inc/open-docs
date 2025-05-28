"use client"

import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/_components/ui/sidebar"
import type { FileNode } from "@/lib/get-docs-files"
import { ChevronRightIcon } from "lucide-react"
import Link from "next/link"
import { GetFileIcon } from "./get-file-icon"

type Props = {
  node: FileNode
  depth?: number
  currentPath?: string
  onSelectDirectory?: (path: string) => void
}

export function DirectoryFileTreeNode(props: Props) {
  const isDirectory = props.node.type === "directory"

  const hasChildren =
    isDirectory && props.node.children && props.node.children.length > 0

  const formatPath = (path: string) => {
    // "docs/" を取り除く
    return path.replace(/^docs\//, "")
  }

  const depth = props.depth || 0

  if (isDirectory) {
    const isSelected = props.currentPath === formatPath(props.node.path)
    const handleClick = (e: React.MouseEvent) => {
      if (props.onSelectDirectory) {
        e.preventDefault()
        props.onSelectDirectory(formatPath(props.node.path))
      }
    }

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          style={{ paddingLeft: 8 + depth * 8 }}
          className={isSelected ? "bg-sidebar-accent font-medium" : ""}
          onClick={handleClick}
        >
          {hasChildren && (
            <span>
              <ChevronRightIcon size={16} />
            </span>
          )}
          <span>{props.node.name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Link href={`/directories/${formatPath(props.node.path)}`}>
      <SidebarMenuItem>
        <SidebarMenuButton style={{ paddingLeft: 8 + depth * 8 }}>
          <GetFileIcon fileName={props.node.name} />
          {props.node.name}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </Link>
  )
}
