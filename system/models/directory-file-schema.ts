import { z } from "zod"

/**
 * ディレクトリファイルのレスポンススキーマ
 */
export const zDirectoryFile = z.object({
  path: z.string(),
  fileName: z.string(),
  frontMatter: z.record(z.string(), z.unknown()).nullable(),
  content: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
})
