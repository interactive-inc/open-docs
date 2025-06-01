"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

type RemoveFeatureParams = {
  pageId: string
  featureId: string
  project: string
}

export function useRemoveFeatureFromPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: RemoveFeatureParams) => {
      const response = await fetch("/api/pages/features", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })
      if (!response.ok) {
        throw new Error("Failed to remove feature")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
}
