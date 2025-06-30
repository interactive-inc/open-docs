import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { normalizePath } from "@/lib/path-utils"

type Params = {
  path: string
  field?: string
  value?: unknown
}

const endpoint = apiClient.api.files[":path{.+}"]

export function useFilePropertiesMutation() {
  return useMutation({
    async mutationFn(params: Params) {
      const normalizedPath = normalizePath(params.path)

      const path = normalizedPath.startsWith("/")
        ? normalizedPath.substring(1)
        : normalizedPath

      const properties = params.field ? { [params.field]: params.value } : {}

      const response = await endpoint.$put({
        param: { path },
        json: {
          properties,
          content: null,
          title: null,
          description: null,
          isArchived: null,
        },
      })

      return response.json()
    },
  })
}
