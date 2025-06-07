import { z } from "zod"

export const zAppFileFrontMatter = z.record(
  z.string(),
  z.union([
    z.string(),
    z.boolean(),
    z.number(),
    z.array(z.string()),
    z.array(z.number()),
    z.array(z.boolean()),
  ]),
)

export type AppFileFrontMatter = z.infer<typeof zAppFileFrontMatter>
