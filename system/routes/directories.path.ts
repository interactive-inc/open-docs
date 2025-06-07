import path from "node:path"
import { DocEngine } from "@/lib/docs-engine/doc-engine"
import { zAppFileFrontMatter } from "@/lib/docs-engine/models"
import { factory } from "@/lib/factory"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import type { SchemaDefinition } from "@/lib/types/schema-types"
import { HTTPException } from "hono/http-exception"

/**
 * GET /api/directories/:path - ディレクトリデータ取得（ディレクトリ専用）
 */
export const GET = factory.createHandlers(async (c) => {
  const currentPath = c.req.param("path")

  if (currentPath === undefined) {
    throw new HTTPException(400, {})
  }

  const docsPath = "docs"

  const mainEngine = new DocEngine({
    basePath: path.join(process.cwd(), docsPath),
  })

  // パスの存在確認
  if (!(await mainEngine.exists(currentPath))) {
    throw new HTTPException(404, {
      message: `ディレクトリが見つかりません: ${currentPath}`,
    })
  }

  // ディレクトリであることを確認
  if (!(await mainEngine.isDirectory(currentPath))) {
    throw new HTTPException(400, {
      message: `指定されたパスはディレクトリではありません: ${currentPath}`,
    })
  }

  // ディレクトリデータを取得
  const docDirectory = await mainEngine.getDirectory(currentPath)

  const rawData = docDirectory.toJSON()

  // ファイル一覧を取得（README.mdとindex.mdを除外）
  const markdownContents = await mainEngine.readMarkdownContents(currentPath)

  const files = markdownContents
    .filter(
      (file) =>
        !file.filePath.endsWith("README.md") &&
        !file.filePath.endsWith("index.md"),
    )
    .map((file) => {
      // スキーマなどの特殊なプロパティを除外してfront matterをクリーンアップ
      const cleanFrontMatter = file.frontMatter || {}
      const { schema, ...validFrontMatter } = cleanFrontMatter as Record<
        string,
        unknown
      > & { schema?: unknown }

      // zodでバリデーションして適合しない値を除外
      const parsedFrontMatter = zAppFileFrontMatter.safeParse(validFrontMatter)

      return {
        path: `${docsPath}/${file.filePath}`,
        frontMatter: parsedFrontMatter.success ? parsedFrontMatter.data : {},
        content: file.content,
        title: file.title || null,
        description: new OpenMarkdown(file.content).description,
      }
    })

  // スキーマを適切な型に変換
  const convertSchema = (
    schema: typeof rawData.schema,
  ): SchemaDefinition | null => {
    if (!schema) return null

    const converted: SchemaDefinition = {}
    for (const [key, field] of Object.entries(schema)) {
      let type = field.type
      if (type === "array") {
        type = "array-string" // デフォルト変換
      }

      converted[key] = {
        type: type as SchemaDefinition[string]["type"],
        required: field.required,
        description: field.description,
      }
    }
    return converted
  }

  // ディレクトリ名を抽出
  const directoryName = currentPath.split("/").filter(Boolean).pop() || "Root"

  // ディレクトリのindex.mdからdescriptionを取得
  let directoryDescription: string | null = null
  const indexPath = `${currentPath}/index.md`
  if (await mainEngine.exists(indexPath)) {
    const indexContent = await mainEngine.readFileContent(indexPath)
    directoryDescription = new OpenMarkdown(indexContent).description
  }

  // クライアント用の最適化されたレスポンス
  const response = {
    isFile: false as const,
    schema: convertSchema(rawData.schema),
    title: rawData.title || null,
    description: directoryDescription,
    indexPath: rawData.indexPath,
    files,
    // 追加の計算済み値
    directoryName,
    markdownFilePaths: files.map((f) => f.path),
    cwd: process.cwd(),
  }

  return c.json(response)
})
