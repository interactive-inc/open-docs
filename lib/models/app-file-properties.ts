import { z } from "zod"

// ファイルプロパティ更新APIのレスポンス
export const zAppFileProperties = z.object({
  success: z.boolean(),
  frontMatter: z.record(z.any()),
})
