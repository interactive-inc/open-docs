import type { ReactNode } from "react"
import { SidebarButton } from "@/components/sidebar-button"
import { Input } from "@/components/ui/input"

type Props = {
  filePath: string
}

export function PageHeader(props: Props): ReactNode {
  const paths = props.filePath.split("/")

  const fileName = paths[paths.length - 1]

  return (
    <div className="flex flex-1 items-center gap-2">
      <SidebarButton />
      <Input value={fileName} readOnly />
    </div>
  )
}
