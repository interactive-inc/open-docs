import { zValidator } from "@hono/zod-validator"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { factory } from "../utils/factory"

/**
 * 新しいMarkdownファイルを作成する
 */
export const POST = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      directoryPath: z.string(),
      fileName: z.string().optional(),
    }),
  ),
  async (c) => {
    const body = c.req.valid("json")

    const directory = c.var.client.directory(body.directoryPath)

    const fileRef = await directory.createMdFile(body.fileName)

    const file = await fileRef.read()

    if (file instanceof Error) {
      throw new HTTPException(500, {
        message: file.message,
      })
    }

    return c.json(file.toJson(), 202)
  },
)
