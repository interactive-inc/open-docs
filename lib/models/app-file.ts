import { z } from "zod"

// ファイルAPIのレスポンス
export const zAppFile = z.object({
  path: z.string(),
  frontMatter: z.record(z.unknown()),
  content: z.string(),
})
