import { createRootRoute, Outlet } from "@tanstack/react-router"
import { Suspense } from "react"
import { RootViewSkeleton } from "@/components/app-skeleton"
import { DirectoryLayoutSidebar } from "@/components/directory-layout-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export const Route = createRootRoute({
  component: Component,
})

export default function Component() {
  return (
    <SidebarProvider>
      <Suspense fallback={<RootViewSkeleton />}>
        <DirectoryLayoutSidebar>
          <Outlet />
        </DirectoryLayoutSidebar>
      </Suspense>
    </SidebarProvider>
  )
}
