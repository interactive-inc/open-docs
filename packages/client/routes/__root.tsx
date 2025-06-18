import { createRootRoute, Outlet } from "@tanstack/react-router"
import { Suspense } from "react"
import { DirectoryLayoutSidebar } from "@/components/directory-layout-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export const Route = createRootRoute({
  component: Component,
})

export default function Component() {
  return (
    <SidebarProvider>
      <Suspense fallback={<div>ファイルツリーを読み込み中...</div>}>
        <DirectoryLayoutSidebar>
          <Outlet />
        </DirectoryLayoutSidebar>
      </Suspense>
    </SidebarProvider>
  )
}
