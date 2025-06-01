import fs from "node:fs/promises"

export async function readMarkdownFiles(path: string): Promise<string[]> {
  try {
    const files = await fs.readdir(path)
    return files.filter((file) => file.endsWith(".md") && file !== "README.md")
  } catch (error) {
    // ディレクトリが存在しない場合は空配列を返す
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return []
    }
    throw error
  }
}
