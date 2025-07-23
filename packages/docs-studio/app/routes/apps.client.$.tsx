import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"
import { ProjectView } from "@/components/project-view/project-view"
import { ProjectViewSkeleton } from "@/components/prpject-view-skeleton"

export const Route = createFileRoute("/apps/client/$")({
  component: Component,
})

function Component() {
  const params = Route.useParams()

  if (params._splat === undefined) {
    return null
  }

  return (
    <Suspense fallback={<ProjectViewSkeleton />}>
      <ProjectView project={params._splat} />
    </Suspense>
  )
}
