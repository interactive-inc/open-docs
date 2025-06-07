import { z } from "zod"

export const zDocsEngineProps = z.object({
  basePath: z.string(),
  indexFileName: z.string().optional(),
  readmeFileName: z.string().optional(),
})

export type DocsEngineProps = z.infer<typeof zDocsEngineProps>
