import { z } from "zod"

export const zDirectoryStructure = z.object({
  path: z.string(),
  hasIndex: z.boolean(),
  hasReadme: z.boolean(),
  markdownCount: z.number(),
  subdirectories: z.array(z.string()),
})

export type DirectoryStructure = z.infer<typeof zDirectoryStructure>
