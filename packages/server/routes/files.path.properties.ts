import path from "node:path"
import { zValidator } from "@hono/zod-validator"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { cwd } from "@/lib/cwd"
import { DocEngine } from "@/lib/engine/doc-engine"
import { factory } from "@/lib/factory"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"

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

    // Honoルート `:path{.+}/properties` では、:path{.+} の部分だけがキャプチャされる
    // つまり rawPath は `products/client/features/add-inventory.md` のようになる
    const filePath = rawPath

    const docsEngine = new DocEngine({
      basePath: path.join(cwd(), "docs"),
      indexFileName: null,
      readmeFileName: null,
    })

    // ファイルの存在確認
    if (!(await docsEngine.exists(filePath))) {
      throw new HTTPException(404, {
        message: `ファイルが見つかりません: ${filePath}`,
      })
    }

    const docFile = await docsEngine.getFile(filePath)
    const markdownContent = await docsEngine.readFileContent(filePath)
    const openMarkdown = new OpenMarkdown(markdownContent)

    // FrontMatterを更新
    let updatedFrontMatter: Record<string, unknown> = {
      ...docFile.frontMatter.value,
    }

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
    const updatedContent = openMarkdown.withFrontMatter(updatedFrontMatter).text

    // ファイルに書き込む
    await docsEngine.writeFileContent(filePath, updatedContent)

    // 更新後のファイル情報を統一フォーマットで返す
    const docFileEntity = await docsEngine.getFile(filePath)
    return c.json(docFileEntity.toJson())
  },
)
