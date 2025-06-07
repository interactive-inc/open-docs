"use client"

import { apiClient } from "@/lib/api-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"

type UpdatePropertiesParams = {
  path: string
  field?: string
  value?: unknown
  properties?: Record<string, unknown>
}

export function useUpdateProperties() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UpdatePropertiesParams) => {
      const normalizedPath = params.path.replace(/^docs\//, "")

      const properties = params.field
        ? { [params.field]: params.value }
        : params.properties || {}

      const response = await apiClient.api.files[":path{.+}"].$put({
        param: {
          path: normalizedPath,
        },
        json: {
          properties,
          body: null,
          title: null,
          description: null,
        },
      })

      return response.json()
    },
    onSuccess: (data, variables) => {
      const normalizedPath = variables.path.replace(/^docs\//, "")

      queryClient.invalidateQueries({
        queryKey: ["file-content", normalizedPath],
      })

      const pathParts = normalizedPath.split("/")

      pathParts.pop()

      const directoryPath = pathParts.join("/")

      queryClient.invalidateQueries({
        queryKey: ["directory-data", directoryPath],
      })
    },
  })
}
