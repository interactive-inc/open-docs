import { PanelLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"

export function SidebarButton() {
  const sidebar = useSidebar()

  return (
    <Button variant={"outline"} onClick={sidebar.toggleSidebar} size={"icon"}>
      <PanelLeftIcon />
    </Button>
  )
}
