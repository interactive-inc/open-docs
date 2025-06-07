import * as path from "node:path"
import { DocEngine } from "@/lib/docs-engine/doc-engine"
import { factory } from "@/lib/factory"
import { zAppError } from "@/lib/models"
import { zFeatureFrontMatter } from "@/lib/models/feature-front-matter"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

/**
 * 機能の情報を更新する
 * @param project プロジェクト名
 * @param feature 機能ID
 * @param priority 優先度 (high | medium | low)
 * @param status ステータス (pending | in-progress | completed)
 * @returns 更新結果
 */
export const PUT = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      project: z.string(),
      feature: z.string(),
    }),
  ),
  zValidator(
    "json",
    z.object({
      priority: z.enum(["high", "medium", "low"]).optional(),
      status: z.enum(["pending", "in-progress", "completed"]).optional(),
    }),
  ),
  async (c) => {
    const params = c.req.valid("param")
    const body = c.req.valid("json")

    const docsEngine = new DocEngine({
      basePath: path.join(process.cwd(), "docs/products"),
    })

    const featurePath = `${params.project}/features/${params.feature}.md`

    // ファイルの存在確認
    if (!(await docsEngine.exists(featurePath))) {
      const errorResponse = zAppError.parse({
        error: `機能が見つかりません: ${params.feature}`,
      })
      return c.json(errorResponse, 404)
    }

    const docFile = await docsEngine.getFile(featurePath)
    const markdownContent = await docsEngine.readFileContent(featurePath)
    const openMarkdown = new OpenMarkdown(markdownContent)

    const updatedFrontMatter = { ...docFile.frontMatter.data }

    // 優先度の更新
    if (body.priority) {
      const priorityValue =
        body.priority === "high" ? 0 : body.priority === "medium" ? 1 : 2
      updatedFrontMatter.priority = priorityValue
    }

    // ステータスの更新
    if (body.status) {
      updatedFrontMatter["is-done"] = body.status === "completed"
    }

    const validatedFrontMatter = zFeatureFrontMatter.parse(updatedFrontMatter)

    const markdownText = openMarkdown.withFrontMatter(validatedFrontMatter).text

    await docsEngine.writeFileContent(featurePath, markdownText)

    return c.json({
      success: true,
      message: `機能を更新しました: ${params.feature}`,
      data: {
        project: params.project,
        feature: params.feature,
        priority: body.priority,
        status: body.status,
      },
    })
  },
)

/**
 * 機能の情報を取得する
 * @param project プロジェクト名
 * @param feature 機能ID
 * @returns 機能情報
 */
export const GET = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      project: z.string(),
      feature: z.string(),
    }),
  ),
  async (c) => {
    const params = c.req.valid("param")

    const docsEngine = new DocEngine({
      basePath: path.join(process.cwd(), "docs/products"),
    })

    const featurePath = `${params.project}/features/${params.feature}.md`

    // ファイルの存在確認
    if (!(await docsEngine.exists(featurePath))) {
      const errorResponse = zAppError.parse({
        error: `機能が見つかりません: ${params.feature}`,
      })
      return c.json(errorResponse, 404)
    }

    const docFile = await docsEngine.getFile(featurePath)
    const markdownContent = await docsEngine.readFileContent(featurePath)
    const openMarkdown = new OpenMarkdown(markdownContent)
    const { frontMatter, content } = {
      frontMatter: docFile.frontMatter.data,
      content: openMarkdown.content,
    }

    return c.json({
      project: params.project,
      feature: params.feature,
      frontMatter,
      content,
    })
  },
)
