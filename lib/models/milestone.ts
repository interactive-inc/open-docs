import { z } from "zod"

export const zMilestone = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
})
