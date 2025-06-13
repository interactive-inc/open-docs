"use client"

import { apiClient } from "@/lib/api-client"
import { useSuspenseQuery } from "@tanstack/react-query"

const endpoint = apiClient.api.files[":path{.+}"]

export function useFileQuery(path: string) {
  const normalizedPath = path.replace(/^docs\//, "")

  return useSuspenseQuery({
    queryKey: [endpoint.$url({ param: { path: normalizedPath } })],
    async queryFn() {
      const resp = await endpoint.$get({ param: { path: normalizedPath } })

      return resp.json()
    },
  })
}
