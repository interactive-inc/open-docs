"use client"

import { apiClient } from "@/lib/api-client"
import { useSuspenseQuery } from "@tanstack/react-query"

export function useDirectorySchema(filePath: string) {
  const pathSegments = filePath.replace(/^docs\//, "").split("/")

  pathSegments.pop()

  const directoryPath = pathSegments.join("/")

  return useSuspenseQuery({
    queryKey: ["directory-schema", directoryPath],
    queryFn: async () => {
      const response = await apiClient.api.directories[":path{.+}"].$get({
        param: {
          path: directoryPath,
        },
      })

      const data = await response.json()

      return data
    },
  })
}
