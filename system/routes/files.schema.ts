import { DocEngine } from "@/lib/docs-engine/doc-engine"
import { factory } from "@/lib/factory"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import { zValidator } from "@hono/zod-validator"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"

const updateSchemaSchema = z.object({
  path: z.string(),
  schema: z.record(
    z.object({
      type: z.enum([
        "string",
        "number",
        "boolean",
        "array-string",
        "array-number",
        "array-boolean",
        "relation",
        "array-relation",
      ]),
      required: z.boolean().optional(),
      description: z.string().optional(),
      relationPath: z.string().optional(),
      default: z.unknown().optional(),
    }),
  ),
  merge: z.boolean().optional().default(true),
})

/**
 * ファイルのスキーマを更新する
 */
export const PUT = factory.createHandlers(
  zValidator("json", updateSchemaSchema),
  async (c) => {
    const { path, schema, merge } = c.req.valid("json")

    const docEngine = new DocEngine({ basePath: "docs" })

    // ファイルの存在確認
    if (!(await docEngine.fileExists(path))) {
      throw new HTTPException(404, { message: "File not found" })
    }

    // ファイル内容を読み込む
    const content = await docEngine.readFileContent(path)
    const openMarkdown = new OpenMarkdown(content)
    const frontMatter = openMarkdown.frontMatter.data || {}

    // スキーマを更新
    if (merge && frontMatter.schema) {
      // 既存のスキーマとマージ
      frontMatter.schema = {
        ...frontMatter.schema,
        ...schema,
      }
    } else {
      // 完全に置き換え
      frontMatter.schema = schema
    }

    // ファイルを保存
    const updatedMarkdown = OpenMarkdown.fromProps({
      frontMatter,
      content: openMarkdown.content,
    })
    await docEngine.saveFile(path, updatedMarkdown.text)

    return c.json({ success: true, schema: frontMatter.schema })
  },
)
