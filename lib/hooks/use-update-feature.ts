"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

type UpdateFeaturePriorityParams = {
  featureId: string
  primary: "high" | "medium" | "low"
  project: string
}

type UpdateFeatureStatusParams = {
  featureId: string
  isDone: boolean
  project: string
}

export function useUpdateFeaturePriority() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UpdateFeaturePriorityParams) => {
      const response = await fetch("/api/features/priority", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })
      if (!response.ok) {
        throw new Error("Failed to update feature priority")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
}

export function useUpdateFeatureStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UpdateFeatureStatusParams) => {
      const response = await fetch("/api/features/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })
      if (!response.ok) {
        throw new Error("Failed to update feature status")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
}
