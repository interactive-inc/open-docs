"use client"

import { apiClient } from "@/lib/api-client"
import { useMutation } from "@tanstack/react-query"

type Params = {
  path: string
  field?: string
  value?: unknown
}

const endpoint = apiClient.api.files[":path{.+}"]

export function useFilePropertiesMutation() {
  return useMutation({
    async mutationFn(params: Params) {
      const normalizedPath = params.path.replace(/^docs\//, "")

      const properties = params.field ? { [params.field]: params.value } : {}

      const response = await endpoint.$put({
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
  })
}
