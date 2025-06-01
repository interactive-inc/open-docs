"use client"

import { Button } from "@/app/_components/ui/button"
import { useSidebar } from "@/app/_components/ui/sidebar"
import { PanelLeftIcon } from "lucide-react"
import type { ReactNode } from "react"

export function SidebarButton(): ReactNode {
  const sidebar = useSidebar()

  return (
    <Button variant={"outline"} onClick={sidebar.toggleSidebar} size={"icon"}>
      <PanelLeftIcon />
    </Button>
  )
}
