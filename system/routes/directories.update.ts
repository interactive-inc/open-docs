import path from "node:path"
import { DocEngine } from "@/lib/docs-engine/doc-engine"
import { factory } from "@/lib/factory"
import { zAppFileProperties } from "@/system/models/app-file-properties"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import { zValidator } from "@hono/zod-validator"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"

/**
 * ディレクトリのプロパティ（index.mdのフロントマター）を更新する
 */
export const PUT = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      properties: z.record(z.string(), z.unknown()).nullable(),
      title: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
    }),
  ),
  async (c) => {
    const body = c.req.valid("json")
    const rawPath = c.req.param("path")

    if (rawPath === undefined) {
      throw new HTTPException(400, {})
    }

    const directoryPath = rawPath

    const docsEngine = new DocEngine({
      basePath: path.join(process.cwd(), "docs"),
    })

    // ディレクトリの存在確認
    if (!(await docsEngine.exists(directoryPath))) {
      throw new HTTPException(404, {
        message: `ディレクトリが見つかりません: ${directoryPath}`,
      })
    }

    // index.mdの処理
    const indexPath = docsEngine.indexFilePath(directoryPath)
    const indexExists = await docsEngine.fileExists(indexPath)

    if (!indexExists) {
      throw new HTTPException(404, {
        message: `index.mdが見つかりません: ${indexPath}`,
      })
    }

    const markdownContent = await docsEngine.readFileContent(indexPath)
    const openMarkdown = new OpenMarkdown(markdownContent)
    const docFile = await docsEngine.getFile(indexPath)

    let updatedContent = markdownContent
    let updatedFrontMatter = { ...docFile.frontMatter.data }

    // titleが指定されている場合はH1を更新
    if (body.title !== undefined && body.title !== null) {
      const openMd = new OpenMarkdown(updatedContent)
      const updatedMd = openMd.withTitle(body.title)
      updatedContent = updatedMd.text
    }

    // descriptionが指定されている場合はH1の次の段落を更新
    if (body.description !== undefined && body.description !== null) {
      const openMd = new OpenMarkdown(updatedContent)
      // H1がない場合のデフォルトタイトルを取得（ディレクトリ名から）
      const dirName = path.basename(directoryPath)
      const defaultTitle = dirName === "index" ? "概要" : dirName
      const updatedMd = openMd.withDescription(body.description, defaultTitle)
      updatedContent = updatedMd.text
    }

    // propertiesが指定されている場合はフロントマターを更新
    if (body.properties) {
      updatedFrontMatter = {
        ...updatedFrontMatter,
        ...body.properties,
      }

      // undefinedの値を削除
      for (const key of Object.keys(updatedFrontMatter)) {
        if (updatedFrontMatter[key] === undefined) {
          delete updatedFrontMatter[key]
        }
      }

      const openMd = new OpenMarkdown(updatedContent)
      updatedContent = openMd.withFrontMatter(updatedFrontMatter).text
    }

    await docsEngine.writeFileContent(indexPath, updatedContent)

    const response = zAppFileProperties.parse({
      success: true,
      frontMatter: updatedFrontMatter,
    })

    return c.json(response)
  },
)
