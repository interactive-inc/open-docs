import * as fs from "node:fs/promises"
import * as path from "node:path"
import { factory } from "@/lib/factory"
import { zAppError, zAppPageFeature } from "@/lib/models"
import { zPage } from "@/lib/models/page"
import { zPageFrontMatter } from "@/lib/models/page-front-matter"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
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
    const openMarkdown = new OpenMarkdown(fileContent)
    const markdown = {
      frontMatter: openMarkdown.frontMatter.data,
      content: openMarkdown.content,
    }

    if (
      markdown.frontMatter === null ||
      Object.keys(markdown.frontMatter).length === 0
    ) {
      const errorResponse = zAppError.parse({
        error: `フロントマターが見つかりません: ${filePath}`,
      })
      return c.json(errorResponse, 400)
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

    const markdownText = openMarkdown
      .withFrontMatter(frontMatter)
      .text

    await fs.writeFile(filePath, markdownText, "utf-8")

    const response = zAppPageFeature.parse({
      success: true,
      message: `ページから機能を削除しました: ${body.featureId}`,
    })
    return c.json(response)
  },
)
