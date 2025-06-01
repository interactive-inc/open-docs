import { z } from "zod"

// 機能ステータス更新APIのレスポンス
export const zAppFeatureStatus = z.object({
  success: z.boolean(),
  message: z.string(),
})
