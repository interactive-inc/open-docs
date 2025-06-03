"use client"

import { apiClient } from "@/lib/api-client"
import { useSuspenseQuery } from "@tanstack/react-query"

export function useFileContent(path: string) {
  const normalizedPath = path.replace(/^docs\//, "")

  return useSuspenseQuery({
    queryKey: ["file-content", normalizedPath],
    queryFn: async () => {
      const response = await apiClient.api.files[":path{.+}"].$get({
        param: {
          path: normalizedPath,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch file")
      }

      return response.json()
    },
  })
}
