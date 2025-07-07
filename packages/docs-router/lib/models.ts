import {
  zDocFile,
  zDocFileIndex,
  zDocRelation,
} from "@interactive-inc/docs-client"
import { z } from "zod/v4"

// serverパッケージ固有の定義
export const zDirectoryJson = z.object({
  cwd: z.string(),
  indexFile: zDocFileIndex,
  files: z.array(zDocFile),
  relations: z.array(zDocRelation),
})
