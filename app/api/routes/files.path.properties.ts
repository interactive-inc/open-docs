import fs from "node:fs/promises"
import { factory } from "@/lib/factory"
import { parseMarkdown } from "@/lib/markdown/parse-markdown"
import { toMarkdownText } from "@/lib/markdown/to-markdown-text"
import { zAppError, zAppFileProperties } from "@/lib/models"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { validateDocsPath } from "../utils"

// PUT /api/files/:path/properties - プロパティの更新
export const PUT = factory.createHandlers(
  zValidator(
    "json",
    z.union([
      z.object({
        field: z.string().min(1),
        value: z.any(),
      }),
      z.record(z.any()),
    ]),
  ),
  async (c) => {
    const body = c.req.valid("json")

    // URLパスから /properties を除去
    const urlPath = c.req.path.replace("/api/files/", "")
    if (!urlPath.endsWith("/properties")) {
      const errorResponse = zAppError.parse({ error: "Invalid path" })
      return c.json(errorResponse, 400)
    }

    const filePath = urlPath.replace(/\/properties$/, "")
    const fullFilePath = `docs/${filePath}`

    const fullPath = validateDocsPath(fullFilePath)

    // ファイルの内容を読み込む
    const fileContent = await fs.readFile(fullPath, "utf-8")
    const parsed = parseMarkdown(fileContent)

    // FrontMatterを更新
    let updatedFrontMatter: Record<string, any>

    if ("field" in body && "value" in body) {
      // 単一フィールドの更新
      updatedFrontMatter = {
        ...parsed.frontMatter,
        [body.field]: body.value,
      }
    } else {
      // 複数フィールドの更新
      updatedFrontMatter = {
        ...parsed.frontMatter,
        ...body,
      }
    }

    // undefinedの値を削除
    for (const key of Object.keys(updatedFrontMatter)) {
      if (updatedFrontMatter[key] === undefined) {
        delete updatedFrontMatter[key]
      }
    }

    // マークダウンテキストを生成
    const updatedContent = toMarkdownText({
      frontMatter: updatedFrontMatter,
      content: parsed.content,
    })

    // ファイルに書き込む
    await fs.writeFile(fullPath, updatedContent, "utf-8")

    const response = zAppFileProperties.parse({
      success: true,
      frontMatter: updatedFrontMatter,
    })
    return c.json(response)
  },
)
