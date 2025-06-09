"use client"

import { apiClient } from "@/lib/api-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"

type MoveFileParams = {
  sourcePath: string
  destinationPath: string
}

export function useMoveFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: MoveFileParams) => {
      const response = await apiClient.api.files.move.$put({
        json: params,
      })

      if (!response.ok) {
        throw new Error("Failed to move file")
      }

      return response.json()
    },
    onSuccess: () => {
      // キャッシュを無効化
      queryClient.invalidateQueries()
    },
  })
}
