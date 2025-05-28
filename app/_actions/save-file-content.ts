"use server"

import fs from "node:fs/promises"
import path from "node:path"

type Props = {
  filePath: string
  content: string
}

export async function saveFileContent(props: Props) {
  try {
    const docsPath = path.join(process.cwd(), "docs")

    // filePath が既に絶対パスなのでそのまま使用
    const absolutePath = props.filePath
    // 安全性確認: ファイルパスがdocsディレクトリ内にあるか確認
    const isInDocsDir = absolutePath.startsWith(docsPath)

    // docsディレクトリ外のファイルは操作不可
    if (!isInDocsDir) {
      throw new Error("Invalid file path: File must be in docs directory")
    }

    // ディレクトリが存在することを確認
    const directory = path.dirname(absolutePath)
    await fs.mkdir(directory, { recursive: true })

    // ファイルに書き込み
    await fs.writeFile(absolutePath, props.content, "utf-8")

    // 更新されたコンテンツを返す
    return { success: true, content: props.content }
  } catch (error) {
    console.error("Error saving file:", error)
    return { success: false, error: String(error) }
  }
}
