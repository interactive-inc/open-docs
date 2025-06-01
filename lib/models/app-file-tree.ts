import { z } from "zod"

// ファイルノードの型定義
export const zAppFileNode: z.ZodType<{
  name: string
  path: string
  type: "file" | "directory"
  children?: Array<{
    name: string
    path: string
    type: "file" | "directory"
    children?: Array<unknown>
    icon?: string
  }>
  icon?: string
}> = z.lazy(() =>
  z.object({
    name: z.string(),
    path: z.string(),
    type: z.enum(["file", "directory"]),
    children: z.array(zAppFileNode).optional(),
    icon: z.string().optional(),
  }),
)

// ファイルツリーAPIのレスポンス
export const zAppFileTree = z.object({
  files: z.array(zAppFileNode),
})
