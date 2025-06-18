"use client"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"
import { ProjectView } from "@/components/project-view/project-view"
import { useClientLoading } from "@/hooks/use-client-loading"

export const Route = createFileRoute("/app/client/page")({
  component: Component,
})

function Component() {
  const isLoading = useClientLoading()

  if (isLoading) {
    return null
  }

  return (
    <Suspense fallback={<div className="p-4">読み込み中...</div>}>
      <ProjectView project={"client"} />
    </Suspense>
  )
}
