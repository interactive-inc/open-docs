import * as fs from "node:fs/promises"
import * as path from "node:path"
import { factory } from "@/lib/factory"
import { parseMarkdown } from "@/lib/markdown/parse-markdown"
import { toMarkdownText } from "@/lib/markdown/to-markdown-text"
import { zFeatureFrontMatter } from "@/lib/models/feature-front-matter"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

const updateFeaturePrioritySchema = z.object({
  featureId: z.string(),
  primary: z.enum(["high", "medium", "low"]),
  project: z.string(),
})

// PUT /api/features/priority - 機能の優先度を更新
export const PUT = factory.createHandlers(
  zValidator("json", updateFeaturePrioritySchema),
  async (c) => {
    const body = c.req.valid("json")
    const baseDirectory = path.join(process.cwd(), "docs/products")

    const featureFilePath = path.join(
      baseDirectory,
      `${body.project}/features/${body.featureId}.md`,
    )

    const fileContent = await fs.readFile(featureFilePath, "utf-8")
    const markdown = parseMarkdown(fileContent)

    if (markdown.frontMatter === null) {
      return c.json(
        {
          error: `フロントマターが見つかりません: ${featureFilePath}`,
        },
        400,
      )
    }

    const priorityValue =
      body.primary === "high" ? "0" : body.primary === "medium" ? "1" : "2"

    const frontMatter = zFeatureFrontMatter.parse({
      ...markdown.frontMatter,
      priority: priorityValue,
    })

    const markdownText = toMarkdownText({
      content: markdown.content,
      frontMatter: frontMatter,
    })

    await fs.writeFile(featureFilePath, markdownText, "utf-8")

    return c.json({
      success: true,
      message: `機能の優先度を更新しました: ${body.featureId}`,
    })
  },
)
