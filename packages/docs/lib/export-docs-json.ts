import { readdir, readFile, writeFile } from "node:fs/promises"
import { join, relative } from "node:path"

type Props = {
  basePath: string
  outputPath?: string
}

/**
 * Convert markdown docs to JSON format and optionally write to file
 *
 * Recursively reads all .md files from the specified basePath,
 * ignoring hidden files/directories (starting with '.').
 *
 * Output JSON format:
 * {
 *   "file1.md": "# File 1 content...",
 *   "subdir/file2.md": "# File 2 content...",
 *   "subdir/nested/file3.md": "# File 3 content..."
 * }
 *
 * Keys are relative paths from basePath
 * Values are raw markdown file contents
 */
export async function docsToJson(
  props: Props,
): Promise<Record<string, string>> {
  const basePath = props.basePath || "docs"

  const files: string[] = []

  async function getAllFiles(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        continue
      }

      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        await getAllFiles(fullPath)
        continue
      }

      if (!entry.isFile()) {
        continue
      }

      if (!entry.name.endsWith(".md")) {
        continue
      }

      files.push(fullPath)
    }
  }

  await getAllFiles(basePath)

  const result: Record<string, string> = {}

  for (const file of files) {
    const relativePath = relative(basePath, file)

    const content = await readFile(file, "utf-8")

    result[relativePath] = content
  }

  if (props.outputPath) {
    const outputPath = `${process.cwd()}/${props.outputPath}`
    const text = JSON.stringify(result, null, 2)
    await writeFile(outputPath, text)
  }

  return result
}
