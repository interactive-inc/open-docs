import { env } from "@/lib/env"
import { factory } from "@/lib/factory"
import { getDocsData } from "@/lib/get-docs-data"
import { zValidator } from "@hono/zod-validator"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"

// GET /api/projects/:project - プロジェクトデータ取得
export const GET = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      path: z
        .string()
        .transform((val) => val.split("/").filter(Boolean).join("/")),
    }),
  ),
  async (c) => {
    const params = c.req.valid("param")
    const project = params.path
    const projects = env().NEXT_PUBLIC_PROJECTS.split(",")

    // プロジェクトが有効かどうかをチェック
    if (!projects.includes(project)) {
      throw new HTTPException(404, { message: "Project not found" })
    }

    const { pages, features } = await getDocsData({
      directory: project,
    })

    return c.json({
      pages,
      features,
      cwd: process.cwd(),
    })
  },
)
