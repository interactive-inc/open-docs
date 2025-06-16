"use client"

import { getDirectoryPath } from "@/app/_utils/get-directory-path"
import { apiClient } from "@/lib/system/api-client"
import { useSuspenseQuery } from "@tanstack/react-query"

const endpoint = apiClient.api.directories[":path{.+}"]

export function useDirectoryQuery(filePath: string) {
  const directoryPath = getDirectoryPath(filePath)

  return useSuspenseQuery({
    queryKey: [endpoint.$url({ param: { path: directoryPath } })],
    async queryFn() {
      const resp = await endpoint.$get({ param: { path: directoryPath } })

      return resp.json()
    },
  })
}
