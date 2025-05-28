"use client"

import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/_components/ui/sidebar"
import type { FileNode } from "@/lib/get-docs-files"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { GetFileIcon } from "./get-file-icon"

type Props = {
  node: FileNode
  depth?: number
}

export function FileTreeNode(props: Props) {
  const [isOpen, setIsOpen] = useState(true)

  const isDirectory = props.node.type === "directory"

  const hasChildren =
    isDirectory && props.node.children && props.node.children.length > 0

  const toggleOpen = () => {
    if (hasChildren) {
      setIsOpen(!isOpen)
    }
  }

  const formatPath = (path: string) => {
    // "docs/" を取り除く
    return path.replace(/^docs\//, "")
  }

  const depth = props.depth || 0

  if (isDirectory) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          style={{ paddingLeft: 8 + depth * 8 }}
          onClick={toggleOpen}
          aria-expanded={isOpen}
        >
          {hasChildren && (
            <span>
              {isOpen ? (
                <ChevronDownIcon size={16} />
              ) : (
                <ChevronRightIcon size={16} />
              )}
            </span>
          )}
          <span>{props.node.name}</span>
        </SidebarMenuButton>
        {isOpen && props.node.children && (
          <div>
            {props.node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                depth={(props.depth || 0) + 1}
              />
            ))}
          </div>
        )}
      </SidebarMenuItem>
    )
  }

  return (
    <Link
      href={`/files/${formatPath(props.node.path)}`}
      className="text-nowrap"
    >
      <SidebarMenuItem>
        <SidebarMenuButton style={{ paddingLeft: 8 + depth * 8 }}>
          <GetFileIcon fileName={props.node.name} />
          {props.node.name}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </Link>
  )
}
