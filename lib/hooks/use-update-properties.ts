"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

type UpdatePropertiesParams = {
  path: string
  field?: string
  value?: unknown
  properties?: Record<string, unknown>
}

export function useUpdateProperties() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UpdatePropertiesParams) => {
      const normalizedPath = params.path.replace(/^docs\//, "")

      const body = params.field
        ? { field: params.field, value: params.value }
        : params.properties || {}

      const response = await fetch(`/api/files/${normalizedPath}/properties`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        throw new Error("Failed to update properties")
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // キャッシュを無効化
      const normalizedPath = variables.path.replace(/^docs\//, "")
      queryClient.invalidateQueries({
        queryKey: ["file-content", normalizedPath],
      })

      // ディレクトリデータのキャッシュも無効化
      // ファイルパスからディレクトリパスを取得
      const pathParts = normalizedPath.split("/")
      pathParts.pop() // ファイル名を削除
      const directoryPath = pathParts.join("/")

      queryClient.invalidateQueries({
        queryKey: ["directory-data", directoryPath],
      })
    },
  })
}
