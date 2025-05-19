import { z } from "zod"

export const vFeatureFrontMatter = z.object({
  milestone: z.union([z.string(), z.null()]).nullable(),
  "is-done": z.union([z.literal("true"), z.literal("false")]).nullable(),
  priority: z.union([z.literal("0"), z.literal("1"), z.literal("2")]),
})
