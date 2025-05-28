import { z } from "zod"
import { zFeature } from "./feature"
import { zMilestone } from "./milestone"
import { zPage } from "./page"

export const vData = z.object({
  pages: z.array(zPage),
  features: z.array(zFeature),
  milestones: z.array(zMilestone),
})

export type Data = z.infer<typeof vData>
