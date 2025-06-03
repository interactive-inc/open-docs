"use client"

import { DirectoryContentView } from "@/app/_components/directory-content-view"
import { FileContentView } from "@/app/_components/file-view/file-content-view"
import { apiClient } from "@/lib/api-client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

export function PageView() {
  const params = useParams<{ directories: string[] }>()

  const { data: fileTreeData } = useSuspenseQuery({
    queryKey: ["file-tree"],
    queryFn: async () => {
      const response = await apiClient.api.files.tree.$get()

      if (!response.ok) {
        throw new Error("Failed to fetch file tree")
      }

      return response.json()
    },
  })
  const files = fileTreeData.files

  const currentPath = params.directories.join("/")

  const { data: directoryData } = useSuspenseQuery({
    queryKey: ["directory-data", currentPath],
    queryFn: async () => {
      const response = await apiClient.api.directories[":path{.+}"].$get({
        param: {
          path: currentPath,
        },
      })

      return response.json()
    },
  })

  if (directoryData.isFile) {
    return (
      <FileContentView
        content={directoryData.content}
        filePath={directoryData.filePath}
      />
    )
  }

  return (
    <DirectoryContentView
      key={currentPath}
      files={files}
      currentPath={currentPath}
      schema={directoryData.schema}
      title={directoryData.title}
      description={directoryData.description}
      indexPath={directoryData.indexPath}
      fileContents={directoryData.files}
    />
  )
}
