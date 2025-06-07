import * as path from "node:path"
import { DocEngine } from "@/lib/docs-engine/doc-engine"
import { factory } from "@/lib/factory"
import { zAppError, zAppFeatureStatus } from "@/lib/models"
import { zFeatureFrontMatter } from "@/lib/models/feature-front-matter"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

const updateFeatureStatusSchema = z.object({
  featureId: z.string(),
  isDone: z.boolean(),
  project: z.string(),
})

/**
 * 機能のステータスを更新する
 * @param featureId 機能ID
 * @param isDone 完了フラグ
 * @param project プロジェクト名
 * @returns 更新結果
 */
export const PUT = factory.createHandlers(
  zValidator("json", updateFeatureStatusSchema),
  async (c) => {
    const body = c.req.valid("json")
    const docsEngine = new DocEngine({
      basePath: path.join(process.cwd(), "docs/products"),
    })

    const featurePath = `${body.project}/features/${body.featureId}.md`

    const exists = await docsEngine.fileExists(featurePath)

    // ファイルの存在確認
    if (!exists) {
      const errorResponse = zAppError.parse({
        error: `機能が見つかりません: ${body.featureId}`,
      })
      return c.json(errorResponse, 404)
    }

    const docFile = await docsEngine.getFile(featurePath)
    const markdownContent = await docsEngine.readFileContent(featurePath)
    const openMarkdown = new OpenMarkdown(markdownContent)

    const updatedFrontMatter = zFeatureFrontMatter.parse({
      ...docFile.frontMatter.data,
      "is-done": body.isDone,
    })

    const markdownText = openMarkdown.withFrontMatter(updatedFrontMatter).text

    await docsEngine.writeFileContent(featurePath, markdownText)

    const response = zAppFeatureStatus.parse({
      success: true,
      message: `機能のステータスを更新しました: ${body.featureId}`,
    })
    return c.json(response)
  },
)
