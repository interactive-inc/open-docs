import { z } from "zod"

// ファイルコンテンツ保存APIのレスポンス
export const zAppFileSave = z.object({
  success: z.boolean(),
  content: z.string(),
})
