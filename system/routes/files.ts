import path from "node:path"
import { DocEngine } from "@/lib/engine/doc-engine"
import { factory } from "@/lib/factory"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

/**
 * 新しいMarkdownファイルを作成する
 */
export const POST = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      directoryPath: z.string(),
    }),
  ),
  async (c) => {
    const body = c.req.valid("json")

    const docsEngine = new DocEngine({
      basePath: path.join(process.cwd(), "docs"),
      indexFileName: null,
      readmeFileName: null,
    })

    const response = await docsEngine.createDraftFile(body.directoryPath)

    return c.json(response)
  },
)
