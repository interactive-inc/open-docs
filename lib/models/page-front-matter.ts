import { z } from "zod"

export const zPageFrontMatter = z.object({
  features: z.array(z.string()).nullable(),
})
