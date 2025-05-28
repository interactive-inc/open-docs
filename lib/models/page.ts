import { z } from "zod"

export const zPage = z.object({
  id: z.string(),
  /**
   * H1
   */
  name: z.string(),
  /**
   * URL
   */
  path: z.string(),
  /**
   * 関連する機能
   */
  features: z.array(z.string()),
})
