import path from "node:path"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { cwd } from "@/lib/cwd"
import { DocEngine } from "@/lib/engine/doc-engine"
import { factory } from "@/lib/factory"

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
      basePath: path.join(cwd(), "docs"),
      indexFileName: null,
      readmeFileName: null,
    })

    const response = await docsEngine.createFile(body.directoryPath)

    return c.json(response)
  },
)
