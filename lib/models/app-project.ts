import { zFeature } from "@/lib/models/feature"
import { zPage } from "@/lib/models/page"
import { z } from "zod"

// プロジェクトAPIのレスポンス
export const zAppProject = z.object({
  pages: z.array(zPage),
  features: z.array(zFeature),
  cwd: z.string(),
})
