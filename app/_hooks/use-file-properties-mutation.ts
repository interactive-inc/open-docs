"use client"

import { apiClient } from "@/lib/system/api-client"
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
      const normalizedPath = params.path
        .replace(/^.*\/docs\//, "") // 絶対パスの場合は/docs/より前を除去
        .replace(/^docs\//, "") // 相対パスの場合はdocs/を除去

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
          isArchived: null,
        },
      })

      return response.json()
    },
  })
}
