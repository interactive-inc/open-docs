import path from "node:path"
import { DocsEngine } from "@/lib/docs-engine/docs-engine"
import { factory } from "@/lib/factory"
import { zAppFile } from "@/lib/models"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import { HTTPException } from "hono/http-exception"

/**
 * ファイルコンテンツを取得する
 * @param path ファイルパス
 * @returns ファイル情報とコンテンツ
 */
export const GET = factory.createHandlers(async (c) => {
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

  const docsEngine = new DocsEngine({
    basePath: path.join(process.cwd(), "docs"),
  })

  const exists = await docsEngine.exists(currentPath)

  if (!exists) {
    throw new HTTPException(400, {})
  }

  const file = docsEngine.file(currentPath)

  const markdownContent = await file.readContent()

  const openMarkdownInstance = new OpenMarkdown(markdownContent)
  const { frontMatter, content } = {
    frontMatter: openMarkdownInstance.frontMatter,
    content: openMarkdownInstance.content,
  }

  const response = zAppFile.parse({
    path: `docs/${currentPath}`,
    frontMatter,
    content,
  })
  return c.json(response)
})
