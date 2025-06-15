import { factory } from "@/lib/factory"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import path from "node:path"
import { DocEngine } from "@/lib/engine/doc-engine"

const requestSchema = z.object({
  path: z.string().min(1, "パスが必要です"),
})

export const POST = factory.createHandlers(
  zValidator("json", requestSchema),
  async (c) => {
    const props = c.req.valid("json")

    const docEngine = new DocEngine({
      basePath: path.join(process.cwd(), "docs"),
      indexFileName: null,
      readmeFileName: null,
    })

    const newPath = await docEngine.moveFileToArchive(props.path)

    return c.json({
      success: true,
      message: "ファイルをアーカイブしました",
      newPath: newPath,
    })
  },
)
