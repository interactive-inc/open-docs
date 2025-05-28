import { z } from "zod"

export const zMilestoneFrontMatter = z.object({
  title: z.string(),
  description: z.string(),
})
