import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { Suspense } from "react"
import { createRoot } from "react-dom/client"
import { Toaster } from "@/components/ui/sonner"
import { routeTree } from "@/lib/route-tree.gen"

import "@/main.css"

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const container = document.getElementById("app")

if (container === null) {
  throw new Error("No container found")
}

const root = createRoot(container)

const queryClient = new QueryClient()

root.render(
  <QueryClientProvider client={queryClient}>
    <Suspense fallback={null}>
      <RouterProvider router={router} />
      <Toaster />
    </Suspense>
  </QueryClientProvider>,
)
