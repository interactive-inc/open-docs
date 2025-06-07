import { z } from "zod"
import { zAppFileFrontMatter } from "./app-file-front-matter"

export const zReadFileResult = z.object({
  exists: z.boolean(),
  frontMatter: zAppFileFrontMatter.optional(),
  content: z.string().optional(),
})

export type ReadFileResult = z.infer<typeof zReadFileResult>
