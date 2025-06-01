import fs from "node:fs/promises"
import path from "node:path"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const filePath = searchParams.get("path")

  if (!filePath) {
    return NextResponse.json({ error: "Path is required" }, { status: 400 })
  }

  try {
    const fullPath = path.join(process.cwd(), filePath)

    // セキュリティ: パスがdocsディレクトリ内にあることを確認
    const normalizedPath = path.normalize(fullPath)
    const docsPath = path.join(process.cwd(), "docs")

    if (!normalizedPath.startsWith(docsPath)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 403 })
    }

    const content = await fs.readFile(fullPath, "utf-8")
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }
}
