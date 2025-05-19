import { z } from "zod"

export const vMilestoneFrontMatter = z.object({
  title: z.string(),
  description: z.string(),
})
