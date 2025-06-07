import { z } from "zod"
import { zAppFileFrontMatter } from "./app-file-front-matter"

export const zDirectoryData = z.object({
  isFile: z.boolean(),
  content: z.string().optional(),
  filePath: z.string().optional(),
  schema: z.record(z.string(), z.unknown()).nullable().optional(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  indexPath: z.string().optional(),
  files: z
    .array(
      z.object({
        path: z.string(),
        frontMatter: zAppFileFrontMatter.nullable(),
        content: z.string(),
        title: z.string().nullable(),
        description: z.string().nullable(),
      }),
    )
    .optional(),
})

export type DirectoryData = z.infer<typeof zDirectoryData>
