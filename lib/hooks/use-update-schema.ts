import { apiClient } from "@/lib/api-client"
import { useMutation } from "@tanstack/react-query"

type UpdateSchemaProps = {
  path: string
  schema: Record<
    string,
    {
      type: string
      required?: boolean
      description?: string
      relationPath?: string
      default?: unknown
    }
  >
  merge?: boolean
}

/**
 * ファイルのスキーマを更新するフック
 */
export function useUpdateSchema() {
  return useMutation({
    mutationFn: async (props: UpdateSchemaProps) => {
      const response = await apiClient.api.files.schema.$put({
        json: props,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update schema")
      }

      return response.json()
    },
  })
}
