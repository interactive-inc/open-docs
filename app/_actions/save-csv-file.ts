"use server"

import fs from "node:fs/promises"
import path from "node:path"

/**
 * CSVファイルの内容を保存するServer Action
 */
export async function saveCSVFile(filePath: string, content: string) {
  try {
    // 安全性チェック: docsディレクトリ内のファイルのみ操作可能
    const basePath = "docs"
    const docsPath = path.join(process.cwd(), basePath)
    const absolutePath = path.join(process.cwd(), filePath)

    if (!absolutePath.startsWith(docsPath)) {
      throw new Error("Invalid file path")
    }

    // ディレクトリが存在することを確認
    const directory = path.dirname(absolutePath)
    await fs.mkdir(directory, { recursive: true })

    // ファイルに書き込み
    await fs.writeFile(absolutePath, content, "utf-8")

    // 更新されたコンテンツを返す
    return { success: true, content }
  } catch (error) {
    console.error("Error saving CSV file:", error)
    return { success: false, error: (error as Error).message }
  }
}
