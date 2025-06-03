"use client"

import { apiClient } from "@/lib/api-client"
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

type UpdateFeatureParams = {
  featureId: string
  project: string
  priority?: "high" | "medium" | "low"
  status?: "pending" | "in-progress" | "completed"
}

export function useUpdateFeaturePriority() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UpdateFeaturePriorityParams) => {
      const response = await apiClient.api.projects[":project"].features[
        ":feature"
      ].$put({
        param: {
          project: params.project,
          feature: params.featureId,
        },
        json: { priority: params.primary },
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
      const status = params.isDone ? "completed" : "pending"
      const response = await apiClient.api.projects[":project"].features[
        ":feature"
      ].$put({
        param: {
          project: params.project,
          feature: params.featureId,
        },
        json: { status },
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

export function useUpdateFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UpdateFeatureParams) => {
      const { featureId, project, ...updateData } = params
      const response = await apiClient.api.projects[":project"].features[
        ":feature"
      ].$put({
        param: {
          project: project,
          feature: featureId,
        },
        json: updateData,
      })

      if (!response.ok) {
        throw new Error("Failed to update feature")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
}
