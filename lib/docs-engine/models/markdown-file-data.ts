import { z } from "zod"
import { zAppFileFrontMatter } from "../../../system/models"

export const zMarkdownFileData = z.object({
  filePath: z.string(),
  frontMatter: zAppFileFrontMatter,
  content: z.string(),
  title: z.string().optional(),
})

export type MarkdownFileData = z.infer<typeof zMarkdownFileData>
