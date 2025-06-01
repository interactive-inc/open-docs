"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

type SaveFileContentParams = {
  filePath: string
  content: string
}

export function useSaveFileContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: SaveFileContentParams) => {
      const response = await fetch("/api/files/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })
      if (!response.ok) {
        throw new Error("Failed to save file content")
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // キャッシュを無効化
      const normalizedPath = variables.filePath.replace(/^docs\//, "")
      queryClient.invalidateQueries({
        queryKey: ["file-content", normalizedPath],
      })
    },
  })
}
