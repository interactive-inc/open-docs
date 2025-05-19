import { z } from "zod"

export function env() {
  const schema = z.object({
    NEXT_PUBLIC_PROJECTS: z.string(),
    NEXT_PUBLIC_DEFAULT_PROJECT: z.string(),
  })

  return schema.parse(process.env)
}
