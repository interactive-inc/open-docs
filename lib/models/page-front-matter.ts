import { z } from "zod"

export const vPageFrontMatter = z.object({
  features: z.array(z.string()).optional().default([]),
})
