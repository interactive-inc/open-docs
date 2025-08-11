import { createRootRoute, Outlet } from "@tanstack/react-router"
import { Suspense } from "react"
import { RootViewSkeleton } from "@/components/app-skeleton"
import { DirectoryLayoutSidebar } from "@/components/directory-layout-sidebar"
import { RootStateProvider } from "@/providers/root-state-provider"

export const Route = createRootRoute({
  component: Component,
})

export default function Component() {
  return (
    <Suspense fallback={<RootViewSkeleton />}>
      <RootStateProvider>
        <DirectoryLayoutSidebar>
          <Outlet />
        </DirectoryLayoutSidebar>
      </RootStateProvider>
    </Suspense>
  )
}
