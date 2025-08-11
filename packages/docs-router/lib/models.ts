import {
  zDocFileIndex,
  zDocFileIndexSchemaField,
  zDocFileIndexSchemaInput,
  zDocFileMd,
  zDocFileUnknown,
  zDocRelation,
} from "@interactive-inc/docs-client"
import { z } from "zod"

export const zDirectoryJson = z.object({
  indexFile: zDocFileIndex,
  files: z.array(z.union([zDocFileMd, zDocFileUnknown])),
  relations: z.array(zDocRelation),
})

export { zDocFileIndexSchemaField, zDocFileIndexSchemaInput }
