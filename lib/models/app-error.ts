import { z } from "zod"

// エラーレスポンス
export const zAppError = z.object({
  error: z.string(),
})
