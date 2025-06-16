import path from "node:path"
import { DocEngine } from "@/lib/engine/doc-engine"
import { factory } from "@/lib/system/factory"
import { normalizePath } from "@/lib/system/utils/normalize-path"
import { zValidator } from "@hono/zod-validator"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"

/**
 * ファイル名からフルパスを検索する
 */
async function findFileByName(
  engine: DocEngine,
  fileName: string,
): Promise<string> {
  // 再帰的にディレクトリを検索
  async function searchInDirectory(dirPath: string): Promise<string | null> {
    try {
      const entries = await engine.deps.fileSystem.readDirectory(dirPath)

      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry)
        const isDirectory = await engine.isDirectory(entryPath)

        if (isDirectory) {
          // ディレクトリの場合は再帰的に検索
          const found = await searchInDirectory(entryPath)
          if (found) return found
        } else if (entry === fileName) {
          // ファイルが見つかった場合
          return entryPath
        }
      }
    } catch {
      // ディレクトリが読み取れない場合は無視
    }
    return null
  }

  const found = await searchInDirectory("")
  if (!found) {
    throw new HTTPException(404, {
      message: `ファイルが見つかりません: ${fileName}`,
    })
  }

  return found
}

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

  const currentPath = normalizePath(rawPath)

  const docsEngine = new DocEngine({
    basePath: path.join(process.cwd(), "docs"),
    indexFileName: null,
    readmeFileName: null,
  })

  const exists = await docsEngine.exists(currentPath)

  if (!exists) {
    throw new HTTPException(400, {})
  }

  const response = await docsEngine.readFile(currentPath)

  return c.json(response)
})

/**
 * ファイルのプロパティ（フロントマター）またはコンテンツを更新する
 */
export const PUT = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      properties: z.record(z.string(), z.unknown()).nullable(),
      body: z.string().nullable(),
      title: z.string().nullable(),
      description: z.string().nullable(),
      isArchived: z.boolean().nullable(),
    }),
  ),
  async (c) => {
    const body = c.req.valid("json")

    const rawPath = c.req.param("path")

    if (rawPath === undefined) {
      throw new HTTPException(400, { message: "Path parameter is required" })
    }

    const docsEngine = new DocEngine({
      basePath: path.join(process.cwd(), "docs"),
      indexFileName: null,
      readmeFileName: null,
    })

    // ファイル名のみの場合はフルパスを解決
    let filePath = rawPath

    if (!rawPath.includes("/") && !rawPath.endsWith(".md")) {
      // ファイル名のみの場合、全ディレクトリから検索
      filePath = await findFileByName(docsEngine, `${rawPath}.md`)
    }

    const exists = await docsEngine.exists(filePath)

    if (!exists) {
      throw new HTTPException(404, {
        message: `ファイルが見つかりません: ${filePath}`,
      })
    }

    // アーカイブ操作を最初に処理
    if (body.isArchived !== null && body.isArchived !== undefined) {
      if (body.isArchived) {
        // アーカイブする
        const newPath = await docsEngine.moveFileToArchive(filePath)
        return c.json({
          success: true,
          message: "ファイルをアーカイブしました",
          newPath: newPath,
        })
      }

      // 復元する（アーカイブから元の場所に戻す）
      const parentDir = path.dirname(filePath)
      const fileName = path.basename(filePath)
      const originalPath = path.join(parentDir.replace(/\/_$/, ""), fileName)

      await docsEngine.moveFile(filePath, originalPath)
      return c.json({
        success: true,
        message: "ファイルを復元しました",
        newPath: originalPath,
      })
    }

    if (body.properties) {
      const docFile = await docsEngine.getFile(filePath)

      const completeFrontMatter = docFile.frontMatter.data

      const draftFrontMatter: Record<string, unknown> = {
        ...completeFrontMatter,
        ...body.properties,
      }

      // undefinedの値を削除
      for (const key of Object.keys(draftFrontMatter)) {
        if (draftFrontMatter[key] === undefined) {
          delete draftFrontMatter[key]
        }
      }

      const updatedDocFile = docFile.withFrontMatter(draftFrontMatter)

      const markdownText = updatedDocFile.toMarkdownText()

      await docsEngine.writeFileContent(filePath, markdownText)

      // 更新後のファイル情報を統一フォーマットで返す
      const response = await docsEngine.readFile(filePath)

      return c.json(response)
    }

    if (body.title) {
      const docFile = await docsEngine.getFile(filePath)

      const draftDocFile = docFile.withTitle(body.title)

      const markdownText = draftDocFile.toMarkdownText()

      await docsEngine.writeFileContent(filePath, markdownText)

      const response = await docsEngine.readFile(filePath)

      return c.json(response)
    }

    if (body.description !== null && body.description !== undefined) {
      const docFile = await docsEngine.getFile(filePath)

      const fileName = path.basename(filePath, ".md")

      const defaultTitle = fileName === "index" ? "概要" : fileName

      const draftDocFile = docFile.withDescription(
        body.description,
        defaultTitle,
      )
      const updatedMarkdown = draftDocFile.toMarkdownText()

      await docsEngine.writeFileContent(filePath, updatedMarkdown)

      const response = await docsEngine.readFile(filePath)

      return c.json(response)
    }

    if (body.body) {
      const docFile = await docsEngine.getFile(filePath)

      const draftFocFile = docFile.withContent(body.body)

      const fullMarkdown = draftFocFile.toMarkdownText()

      await docsEngine.writeFileContent(filePath, fullMarkdown)

      const response = await docsEngine.readFile(filePath)

      return c.json(response)
    }

    throw new HTTPException(400, {
      message: `Invalid request: properties=${!!body.properties}, body=${!!body.body}, title=${!!body.title}, description=${!!body.description}, isArchived=${body.isArchived}`,
    })
  },
)

/**
 * ファイルを削除する
 */
export const DELETE = factory.createHandlers(async (c) => {
  const rawPath = c.req.param("path")

  if (rawPath === undefined) {
    throw new HTTPException(400, { message: "Path parameter is missing" })
  }

  const currentPath = normalizePath(rawPath)

  const docsEngine = new DocEngine({
    basePath: path.join(process.cwd(), "docs"),
    indexFileName: null,
    readmeFileName: null,
  })

  const filePath = currentPath

  const exists = await docsEngine.exists(filePath)

  if (!exists) {
    throw new HTTPException(404, {
      message: `ファイルが見つかりません: ${filePath}`,
    })
  }

  const isDirectory = await docsEngine.isDirectory(filePath)

  if (isDirectory) {
    throw new HTTPException(400, {
      message: `指定されたパスはディレクトリです: ${filePath}`,
    })
  }

  await docsEngine.deleteFile(filePath)

  return c.json({ success: true })
})
