import { env } from "@/lib/env"
import { factory } from "@/lib/factory"
import { getDocsData } from "@/lib/get-docs-data"
import { zAppProject } from "@/lib/models"
import { zValidator } from "@hono/zod-validator"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"

/**
 * プロジェクトデータを取得する
 */
export const GET = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      project: z.string(),
    }),
  ),
  async (c) => {
    const params = c.req.valid("param")
    const project = params.project
    const projects = env().NEXT_PUBLIC_PROJECTS.split(",")

    // プロジェクトが有効かどうかをチェック
    if (!projects.includes(project)) {
      throw new HTTPException(404, { message: "Project not found" })
    }

    const { pages, features } = await getDocsData({
      directory: project,
    })

    const response = zAppProject.parse({
      pages,
      features,
      cwd: process.cwd(),
    })
    return c.json(response)
  },
)
