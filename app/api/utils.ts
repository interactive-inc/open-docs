import path from "node:path"

// パスの検証とセキュリティチェック
export function validateDocsPath(filePath: string): string {
  const fullPath = path.join(process.cwd(), filePath)
  const normalizedPath = path.normalize(fullPath)
  const docsPath = path.join(process.cwd(), "docs")

  if (!normalizedPath.startsWith(docsPath)) {
    throw new Error("Invalid path: Path must be within docs directory")
  }

  return fullPath
}
