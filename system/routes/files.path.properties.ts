import path from "node:path"
import { DocsEngine } from "@/lib/docs-engine/docs-engine"
import { factory } from "@/lib/factory"
import { zAppError, zAppFileProperties } from "@/lib/models"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import { zValidator } from "@hono/zod-validator"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"

/**
 * ファイルのプロパティ（フロントマター）を更新する
 * @param path ファイルパス
 * @param field 更新するフィールド名（単一フィールド更新時）
 * @param value 更新する値（単一フィールド更新時）
 * @returns 更新結果とフロントマター
 */
export const PUT = factory.createHandlers(
  zValidator(
    "json",
    z.union([
      z.object({
        field: z.string().min(1),
        value: z.any(),
      }),
      z.record(z.string(), z.any()),
    ]),
  ),
  async (c) => {
    const body = c.req.valid("json")

    const rawPath = c.req.param("path")

    if (rawPath === undefined) {
      throw new HTTPException(400, {})
    }

    // パスを正規化（絶対パスから相対パスに変換）
    let currentPath = rawPath

    // 絶対パスの場合、相対パスに変換
    if (currentPath.includes("/docs/")) {
      const docsIndex = currentPath.lastIndexOf("/docs/")
      currentPath = currentPath.substring(docsIndex + 6) // '/docs/'.length = 6
    }

    // docsプレフィックスを削除
    currentPath = currentPath.replace(/^docs\//, "")

    // 先頭のスラッシュを削除
    currentPath = currentPath.replace(/^\/+/, "")

    const urlPath = currentPath

    if (!urlPath.endsWith("/properties")) {
      const errorResponse = zAppError.parse({ error: "Invalid path" })
      return c.json(errorResponse, 400)
    }

    const filePath = urlPath.replace(/\/properties$/, "")

    const docsEngine = new DocsEngine({
      basePath: path.join(process.cwd(), "docs"),
    })

    // ファイルの存在確認
    if (!(await docsEngine.exists(filePath))) {
      const errorResponse = zAppError.parse({
        error: `ファイルが見つかりません: ${filePath}`,
      })
      return c.json(errorResponse, 404)
    }

    const file = docsEngine.file(filePath)
    const markdownContent = await file.readContent()
    const openMarkdown = new OpenMarkdown(markdownContent)
    const { frontMatter, content } = {
      frontMatter: openMarkdown.frontMatter.data,
      content: openMarkdown.content,
    }

    // FrontMatterを更新
    let updatedFrontMatter: Record<string, unknown> = { ...frontMatter }

    if ("field" in body && "value" in body) {
      // 単一フィールドの更新
      updatedFrontMatter[body.field] = body.value
    } else {
      // 複数フィールドの更新
      updatedFrontMatter = {
        ...updatedFrontMatter,
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
    const updatedContent = openMarkdown
      .withFrontMatter(updatedFrontMatter)
      .text

    // ファイルに書き込む
    await file.writeContent(updatedContent)

    const response = zAppFileProperties.parse({
      success: true,
      frontMatter: updatedFrontMatter,
    })
    return c.json(response)
  },
)
