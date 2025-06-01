import { z } from "zod"

// 機能優先度更新APIのレスポンス
export const zAppFeaturePriority = z.object({
  success: z.boolean(),
  message: z.string(),
})
