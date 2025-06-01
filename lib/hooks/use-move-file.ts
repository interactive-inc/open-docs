"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

type MoveFileParams = {
  sourcePath: string
  destinationPath: string
}

export function useMoveFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: MoveFileParams) => {
      const response = await fetch("/api/files/move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
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
