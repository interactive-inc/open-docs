"use client"
import { ProjectView } from "@/app/_components/project-view/project-view"
import { useClientLoading } from "@/app/_hooks/use-client-loading"
import { Suspense } from "react"

export default function Page() {
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
