"use client"

import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { useSidebar } from "@/app/_components/ui/sidebar"
import { PanelLeftIcon } from "lucide-react"
import type { ReactNode } from "react"

type Props = {
  filePath: string
}

export function PageHeader(props: Props): ReactNode {
  const sidebar = useSidebar()

  const paths = props.filePath.split("/")

  const fileName = paths[paths.length - 1]

  return (
    <div className="flex flex-1 items-center gap-2">
      <Button variant={"outline"} onClick={sidebar.toggleSidebar} size={"icon"}>
        <PanelLeftIcon />
      </Button>
      <Input value={fileName} />
    </div>
  )
}
