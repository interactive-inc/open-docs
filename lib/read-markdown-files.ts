import fs from "node:fs/promises"

export async function readMarkdownFiles(path: string): Promise<string[]> {
  const files = await fs.readdir(path)

  return files.filter((file) => file.endsWith(".md") && file !== "README.md")
}
