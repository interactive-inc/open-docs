import { createFileRoute, Outlet } from "@tanstack/react-router"
import { Suspense } from "react"

export const Route = createFileRoute("/$")({
  component: Component,
})

function Component() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-muted-foreground">読み込み中...</div>
        </div>
      }
    >
      <Outlet />
    </Suspense>
  )
}
