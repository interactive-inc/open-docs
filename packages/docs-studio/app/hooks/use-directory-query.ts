import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { getDirectoryPath } from "@/lib/open-csv/get-directory-path"

const endpoint = apiClient.api.directories[":path{.+}"]

export function useDirectoryQuery(filePath: string) {
  const directoryPath = getDirectoryPath(filePath)

  const path = directoryPath.startsWith("/")
    ? directoryPath.substring(1)
    : directoryPath

  return useQuery({
    queryKey: [endpoint.$url({ param: { path } })],
    async queryFn() {
      const resp = await endpoint.$get({ param: { path } })

      if (!resp.ok && resp.status === 404) {
        throw new Error("INDEX_NOT_FOUND")
      }

      return resp.json()
    },
    retry: (failureCount, error) => {
      // INDEX_NOT_FOUNDエラーの場合はリトライしない
      if (error instanceof Error && error.message === "INDEX_NOT_FOUND") {
        return false
      }
      return failureCount < 3
    },
  })
}
