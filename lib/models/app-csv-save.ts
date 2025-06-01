import { z } from "zod"

// CSVファイル保存APIのレスポンス
export const zAppCsvSave = z.object({
  success: z.boolean(),
  content: z.string(),
})
