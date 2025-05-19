import { z } from "zod"
import { vFeature } from "./feature"
import { vMilestone } from "./milestone"
import { vPage } from "./page"

export const vData = z.object({
  pages: z.array(vPage),
  features: z.array(vFeature),
  milestones: z.array(vMilestone),
})

export type Data = z.infer<typeof vData>
