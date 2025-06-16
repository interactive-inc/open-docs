import path from "node:path"
import { DocEngine } from "@/lib/engine/doc-engine"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import { factory } from "@/lib/system/factory"
import { zValidator } from "@hono/zod-validator"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"

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
    indexFileName: null,
    readmeFileName: null,
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

  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let responseData

  if (mainEngine.isArchiveDirectory(currentPath)) {
    const parentPath = path.dirname(currentPath)
    responseData = await mainEngine.readDirectory(parentPath)
  } else {
    responseData = await mainEngine.readDirectory(currentPath)
  }

  // アーカイブ情報を追加
  const archiveInfo =
    await mainEngine.readDirectoryWithArchiveHandling(currentPath)
  const archivedFiles = await mainEngine.getArchivedFiles(currentPath)

  const finalResponse = {
    ...responseData,
    archiveInfo: {
      hasArchive: archiveInfo.hasArchive,
      archiveFileCount: archiveInfo.archiveFiles.length,
    },
    archivedFiles,
  }

  return c.json(finalResponse)
})

/**
 * ディレクトリのプロパティ（index.mdのフロントマター）を更新する
 */
export const PUT = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      properties: z.record(z.string(), z.unknown()).nullable(),
      title: z.string().nullable(),
      description: z.string().nullable(),
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
      indexFileName: null,
      readmeFileName: null,
    })

    const exists = await docsEngine.exists(directoryPath)

    if (!exists) {
      throw new HTTPException(404, {
        message: `ディレクトリが見つかりません: ${directoryPath}`,
      })
    }

    const indexPath = docsEngine.indexFilePath(directoryPath)

    const indexExists = await docsEngine.fileExists(indexPath)

    if (!indexExists) {
      throw new HTTPException(404, {
        message: `index.mdが見つかりません: ${indexPath}`,
      })
    }

    const markdownContent = await docsEngine.readFileContent(indexPath)

    const docFile = await docsEngine.getFile(indexPath)

    let updatedContent = markdownContent
    let updatedFrontMatter = { ...docFile.frontMatter.data }

    // titleが指定されている場合はH1を更新
    if (body.title !== null) {
      const openMd = new OpenMarkdown(updatedContent)
      const updatedMd = openMd.withTitle(body.title)
      updatedContent = updatedMd.text
    }

    // descriptionが指定されている場合はH1の次の段落を更新
    if (body.description !== null) {
      const openMd = new OpenMarkdown(updatedContent)
      // H1がない場合のデフォルトタイトルを取得（ディレクトリ名から）
      const dirName = path.basename(directoryPath)
      const defaultTitle = dirName === "index" ? "概要" : dirName
      const updatedMd = openMd.withDescription(body.description, defaultTitle)
      updatedContent = updatedMd.text
    }

    if (body.properties) {
      updatedFrontMatter = {
        ...updatedFrontMatter,
        ...body.properties,
      }

      // undefinedの値を削除
      for (const key of Object.keys(updatedFrontMatter)) {
        if (updatedFrontMatter[key] !== undefined) continue
        delete updatedFrontMatter[key]
      }

      const openMd = new OpenMarkdown(updatedContent)
      updatedContent = openMd.withFrontMatter(updatedFrontMatter).text
    }

    await docsEngine.writeFileContent(indexPath, updatedContent)

    const directory = await docsEngine.readDirectory(directoryPath)

    return c.json(directory)
  },
)
