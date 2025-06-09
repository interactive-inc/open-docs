import path from "node:path"
import { DocEngine } from "@/lib/docs-engine/doc-engine"
import { factory } from "@/lib/factory"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import { zValidator } from "@hono/zod-validator"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"

/**
 * 新しいMarkdownファイルを作成する
 */
export const POST = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      directoryPath: z.string(),
    }),
  ),
  async (c) => {
    const body = c.req.valid("json")

    const docsEngine = new DocEngine({
      basePath: path.join(process.cwd(), "docs"),
    })

    // ディレクトリの存在確認
    const dirExists = await docsEngine.exists(body.directoryPath)
    if (!dirExists) {
      throw new HTTPException(404, {
        message: `ディレクトリが見つかりません: ${body.directoryPath}`,
      })
    }

    // 既存のdraft-XX.mdファイルを探して次の番号を決定
    const entries = await docsEngine.deps.fileSystem.readDirectory(
      body.directoryPath,
    )
    const draftFiles = entries.filter((f) => f.match(/^draft-\d{2}\.md$/))

    let nextNumber = 0
    if (draftFiles.length > 0) {
      const numbers = draftFiles.map((f) => {
        const match = f.match(/^draft-(\d{2})\.md$/)
        return match?.[1] ? Number.parseInt(match[1], 10) : 0
      })
      nextNumber = Math.max(...numbers) + 1
    }

    const fileName = `draft-${String(nextNumber).padStart(2, "0")}.md`
    const filePath = path.join(body.directoryPath, fileName)

    // 念のため既存ファイルの確認
    const fileExists = await docsEngine.fileExists(filePath)
    if (fileExists) {
      throw new HTTPException(409, {
        message: `ファイルが既に存在します: ${filePath}`,
      })
    }

    // ディレクトリのスキーマを取得してデフォルトのFrontMatterを生成
    const defaultFrontMatter: Record<string, unknown> = {}
    try {
      const directoryData = await docsEngine.getDirectory(body.directoryPath)
      const schema = directoryData.schema

      if (schema) {
        for (const [key, field] of Object.entries(schema)) {
          if (field.type === "string") {
            defaultFrontMatter[key] = ""
          } else if (field.type === "boolean") {
            defaultFrontMatter[key] = false
          } else if (field.type === "number") {
            defaultFrontMatter[key] = 0
          } else if (field.type === "array-string") {
            defaultFrontMatter[key] = []
          }
        }
      }
    } catch (error) {
      // スキーマ取得に失敗しても続行
    }

    // ファイル名からタイトルを生成
    const fileNameWithoutExt = fileName.replace(/\.md$/, "")
    const title = fileNameWithoutExt

    // 新しいMarkdownコンテンツを作成
    const openMarkdown = OpenMarkdown.fromProps({
      frontMatter: defaultFrontMatter,
      content: `# ${title}\n\n[ここに説明を入力]`,
    })

    // ファイルを作成
    await docsEngine.writeFileContent(filePath, openMarkdown.text)

    return c.json({
      success: true,
      path: filePath,
      fileName: fileName,
    })
  },
)
