import fs from "node:fs/promises"
import path from "node:path"
import { parseMarkdown } from "@/lib/markdown/parse-markdown"
import { toMarkdownText } from "@/lib/markdown/to-markdown-text"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filePath, field, value } = body

    if (!filePath || !field) {
      return NextResponse.json(
        { error: "filePath and field are required" },
        { status: 400 },
      )
    }

    const fullPath = path.join(process.cwd(), filePath)

    // セキュリティ: パスがdocsディレクトリ内にあることを確認
    const normalizedPath = path.normalize(fullPath)
    const docsPath = path.join(process.cwd(), "docs")

    if (!normalizedPath.startsWith(docsPath)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 403 })
    }

    // ファイルの内容を読み込む
    const fileContent = await fs.readFile(fullPath, "utf-8")
    const { frontMatter, content } = parseMarkdown(fileContent)

    // FrontMatterを更新
    const updatedFrontMatter = {
      ...frontMatter,
      [field]: value,
    }

    // undefinedの値を削除
    Object.keys(updatedFrontMatter).forEach((key) => {
      if (updatedFrontMatter[key] === undefined) {
        delete updatedFrontMatter[key]
      }
    })

    // マークダウンテキストを生成
    const updatedContent = toMarkdownText({
      frontMatter: updatedFrontMatter,
      content,
    })

    // ファイルに書き込む
    await fs.writeFile(fullPath, updatedContent, "utf-8")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating frontmatter:", error)
    return NextResponse.json(
      { error: "Failed to update file" },
      { status: 500 },
    )
  }
}
