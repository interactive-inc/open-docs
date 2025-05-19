import { z } from "zod"

export const vFeature = z.object({
  id: z.string(),
  /**
   * H1
   */
  name: z.string(),
  primary: z.string(),
  milestone: z.string(),
  isDone: z.boolean(),
})
