"use client"

import { apiClient } from "@/lib/api-client"
import { useSuspenseQuery } from "@tanstack/react-query"

export function useDirectorySchema(filePath: string) {
  // ファイルパスからディレクトリパスを取得
  const pathSegments = filePath.replace(/^docs\//, "").split("/")
  pathSegments.pop() // ファイル名を除去
  const directoryPath = pathSegments.join("/")

  return useSuspenseQuery({
    queryKey: ["directory-schema", directoryPath],
    queryFn: async () => {
      if (!directoryPath) {
        return { schema: {}, relations: [] }
      }

      const response = await apiClient.api.directories[":path{.+}"].$get({
        param: {
          path: directoryPath,
        },
      })

      if (!response.ok) {
        return { schema: {}, relations: [] }
      }

      const data = await response.json()
      return {
        schema: data.schema || {},
        relations: data.relations || [],
      }
    },
  })
}
