import * as fs from "node:fs/promises"
import * as path from "node:path"
import { factory } from "@/lib/factory"
import { parseMarkdown } from "@/lib/markdown/parse-markdown"
import { toMarkdownText } from "@/lib/markdown/to-markdown-text"
import { zPage } from "@/lib/models/page"
import { zPageFrontMatter } from "@/lib/models/page-front-matter"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

const removeFeatureFromPageSchema = z.object({
  pageId: z.string(),
  featureId: z.string(),
  project: z.string(),
})

// DELETE /api/pages/features - ページから機能を削除
export const DELETE = factory.createHandlers(
  zValidator("json", removeFeatureFromPageSchema),
  async (c) => {
    const body = c.req.valid("json")
    const baseDirectory = path.join(process.cwd(), "docs/products")

    const filePath = path.join(
      baseDirectory,
      `${body.project}/pages/${body.pageId}.md`,
    )

    const fileContent = await fs.readFile(filePath, "utf-8")
    const markdown = parseMarkdown(fileContent)

    if (markdown.frontMatter === null) {
      return c.json(
        {
          error: `フロントマターが見つかりません: ${filePath}`,
        },
        400,
      )
    }

    const currentFrontMatter = zPage.parse(markdown.frontMatter)
    const currentFeatures = Array.isArray(currentFrontMatter.features)
      ? currentFrontMatter.features
      : []

    const updatedFeatures = currentFeatures.filter((feature) => {
      return feature !== body.featureId
    })

    const frontMatter = zPageFrontMatter.parse({
      ...markdown.frontMatter,
      features: updatedFeatures,
    })

    const markdownText = toMarkdownText({
      content: markdown.content,
      frontMatter: frontMatter,
    })

    await fs.writeFile(filePath, markdownText, "utf-8")

    return c.json({
      success: true,
      message: `ページから機能を削除しました: ${body.featureId}`,
    })
  },
)
