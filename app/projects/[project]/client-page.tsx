"use client"

import { PagesEditor } from "@/app/_components/pages-editor"
import { apiClient } from "@/lib/api-client"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

export function ClientPage() {
  const params = useParams<{ project: string }>()
  const project = params.project

  const { data, isLoading, error } = useQuery({
    queryKey: ["project-data", project],
    queryFn: async () => {
      const response = await apiClient.api.projects[":project"].$get({
        param: {
          project: project,
        },
      })

      return response.json()
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-xl">エラーが発生しました</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>データが見つかりません</div>
      </div>
    )
  }

  return (
    <PagesEditor
      pages={data.pages}
      features={data.features}
      cwd={data.cwd}
      project={project}
    />
  )
}
