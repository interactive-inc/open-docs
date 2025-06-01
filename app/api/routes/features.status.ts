import * as fs from "node:fs/promises"
import * as path from "node:path"
import { factory } from "@/lib/factory"
import { parseMarkdown } from "@/lib/markdown/parse-markdown"
import { toMarkdownText } from "@/lib/markdown/to-markdown-text"
import { zAppError, zAppFeatureStatus } from "@/lib/models"
import { zFeatureFrontMatter } from "@/lib/models/feature-front-matter"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

const updateFeatureStatusSchema = z.object({
  featureId: z.string(),
  isDone: z.boolean(),
  project: z.string(),
})

// PUT /api/features/status - 機能のステータスを更新
export const PUT = factory.createHandlers(
  zValidator("json", updateFeatureStatusSchema),
  async (c) => {
    const body = c.req.valid("json")
    const baseDirectory = path.join(process.cwd(), "docs/products")

    const filePath = path.join(
      baseDirectory,
      `${body.project}/features/${body.featureId}.md`,
    )

    const fileContent = await fs.readFile(filePath, "utf-8")
    const markdown = parseMarkdown(fileContent)

    if (markdown.frontMatter === null) {
      const errorResponse = zAppError.parse({
        error: `フロントマターが見つかりません: ${filePath}`,
      })
      return c.json(errorResponse, 400)
    }

    const frontMatter = zFeatureFrontMatter.parse({
      ...markdown.frontMatter,
      "is-done": body.isDone ? "true" : "false",
    })

    const markdownText = toMarkdownText({
      content: markdown.content,
      frontMatter: frontMatter,
    })

    await fs.writeFile(filePath, markdownText, "utf-8")

    const response = zAppFeatureStatus.parse({
      success: true,
      message: `機能のステータスを更新しました: ${body.featureId}`,
    })
    return c.json(response)
  },
)
