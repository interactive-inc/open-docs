import * as path from "node:path"
import { DocsEngine } from "@/lib/docs-engine/docs-engine"
import { factory } from "@/lib/factory"
import { zAppFeaturePriority } from "@/lib/models"
import { zFeatureFrontMatter } from "@/lib/models/feature-front-matter"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import { zValidator } from "@hono/zod-validator"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"

/**
 * 機能の優先度を更新する
 * @param featureId 機能ID
 * @param primary 優先度 (high | medium | low)
 * @param project プロジェクト名
 * @returns 更新結果
 */
export const PUT = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      featureId: z.string(),
      primary: z.enum(["high", "medium", "low"]),
      project: z.string(),
    }),
  ),
  async (c) => {
    const body = c.req.valid("json")

    const docsEngine = new DocsEngine({
      basePath: path.join(process.cwd(), "docs/products"),
    })

    const featurePath = `${body.project}/features/${body.featureId}.md`

    // ファイルの存在確認
    if (!(await docsEngine.exists(featurePath))) {
      throw new HTTPException(404, {
        message: `機能が見つかりません: ${body.featureId}`,
      })
    }

    const file = docsEngine.file(featurePath)
    const markdownContent = await file.readContent()
    const openMarkdown = new OpenMarkdown(markdownContent)
    const { frontMatter, content } = {
      frontMatter: openMarkdown.frontMatter.data,
      content: openMarkdown.content,
    }

    if (!frontMatter) {
      throw new HTTPException(400, {
        message: `フロントマターが見つかりません: ${featurePath}`,
      })
    }

    const priorityValue =
      body.primary === "high" ? 0 : body.primary === "medium" ? 1 : 2

    const updatedFrontMatter = zFeatureFrontMatter.parse({
      ...frontMatter,
      priority: priorityValue,
    })

    const markdownText = openMarkdown
      .withFrontMatter(updatedFrontMatter)
      .text

    await file.writeContent(markdownText)

    const response = zAppFeaturePriority.parse({
      success: true,
      message: `機能の優先度を更新しました: ${body.featureId}`,
    })
    return c.json(response)
  },
)
