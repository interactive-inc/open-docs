import fs from "node:fs/promises"
import path from "node:path"
import { toFrontMatterText } from "@/lib/markdown/to-front-matter-text"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { filePath, frontMatter } = await request.json()

    if (!filePath) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 },
      )
    }

    const fullPath = path.join(process.cwd(), filePath)
    const dirPath = path.dirname(fullPath)

    // ディレクトリが存在しない場合は作成
    await fs.mkdir(dirPath, { recursive: true })

    // FrontMatterを含む内容を生成
    const frontMatterText = toFrontMatterText(frontMatter)
    const content = `${frontMatterText}

# ${path.basename(dirPath)}
`

    // ファイルを作成
    await fs.writeFile(fullPath, content, "utf-8")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating index file:", error)
    return NextResponse.json(
      { error: "Failed to create index file" },
      { status: 500 },
    )
  }
}