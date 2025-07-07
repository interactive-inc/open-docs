import { useSuspenseQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

const endpoint = apiClient.api.files[":path{.+}"]

export function useFileQuery(currentPath: string) {
  const normalizedPath = currentPath.replace(/^docs\//, "")

  const path = normalizedPath.startsWith("/")
    ? normalizedPath.substring(1)
    : normalizedPath

  return useSuspenseQuery({
    queryKey: [endpoint.$url({ param: { path } })],
    async queryFn() {
      const resp = await endpoint.$get({ param: { path } })

      return resp.json()
    },
  })
}
