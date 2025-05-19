import { z } from "zod"

export const vMilestone = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
})
