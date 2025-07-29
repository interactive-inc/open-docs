import {
  zDocFile,
  zDocFileIndex,
  zDocFileIndexSchemaField,
  zDocFileIndexSchemaInput,
  zDocRelation,
} from "@interactive-inc/docs-client"
import { z } from "zod"

export const zDirectoryJson = z.object({
  cwd: z.string(),
  indexFile: zDocFileIndex,
  files: z.array(zDocFile),
  relations: z.array(zDocRelation),
})

export { zDocFileIndexSchemaField, zDocFileIndexSchemaInput }
