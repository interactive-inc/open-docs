import { z } from "zod"

// ファイル移動APIのレスポンス
export const zAppFileMove = z.object({
  success: z.boolean(),
  message: z.string(),
})
