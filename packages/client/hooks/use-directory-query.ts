import { useSuspenseQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { getDirectoryPath } from "@/lib/open-csv/get-directory-path"

const endpoint = apiClient.api.directories[":path{.+}"]

export function useDirectoryQuery(filePath: string) {
  const directoryPath = getDirectoryPath(filePath)

  const path = directoryPath.startsWith("/")
    ? directoryPath.substring(1)
    : directoryPath

  return useSuspenseQuery({
    queryKey: [endpoint.$url({ param: { path } })],
    async queryFn() {
      const resp = await endpoint.$get({ param: { path } })

      return resp.json()
    },
  })
}
