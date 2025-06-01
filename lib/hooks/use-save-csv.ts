"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

type SaveCsvParams = {
  filePath: string
  content: string
}

export function useSaveCsv() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: SaveCsvParams) => {
      const response = await fetch("/api/files/csv", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })
      if (!response.ok) {
        throw new Error("Failed to save CSV")
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
