import { z } from "zod"

// ページから機能削除APIのレスポンス
export const zAppPageFeature = z.object({
  success: z.boolean(),
  message: z.string(),
})
