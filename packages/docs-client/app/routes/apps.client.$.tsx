import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"
import { ProjectView } from "@/components/project-view/project-view"

export const Route = createFileRoute("/apps/client/$")({
  component: Component,
})

function Component() {
  const params = Route.useParams()

  if (params._splat === undefined) {
    return null
  }

  return (
    <Suspense fallback={<div className="p-4">読み込み中...</div>}>
      <ProjectView project={params._splat} />
    </Suspense>
  )
}
