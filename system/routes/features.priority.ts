import * as path from "node:path"
import { DocEngine } from "@/lib/docs-engine/doc-engine"
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

    const docsEngine = new DocEngine({
      basePath: path.join(process.cwd(), "docs/products"),
    })

    const featurePath = `${body.project}/features/${body.featureId}.md`

    const exists = await docsEngine.fileExists(featurePath)

    // ファイルの存在確認
    if (!exists) {
      throw new HTTPException(404, {
        message: `機能が見つかりません: ${body.featureId}`,
      })
    }

    const docFile = await docsEngine.getFile(featurePath)
    const markdownContent = await docsEngine.readFileContent(featurePath)
    const openMarkdown = new OpenMarkdown(markdownContent)

    const priorityValue =
      body.primary === "high" ? 0 : body.primary === "medium" ? 1 : 2

    const updatedFrontMatter = zFeatureFrontMatter.parse({
      ...docFile.frontMatter.data,
      priority: priorityValue,
    })

    const markdownText = openMarkdown.withFrontMatter(updatedFrontMatter).text

    await docsEngine.writeFileContent(featurePath, markdownText)

    const response = zAppFeaturePriority.parse({
      success: true,
      message: `機能の優先度を更新しました: ${body.featureId}`,
    })

    return c.json(response)
  },
)
