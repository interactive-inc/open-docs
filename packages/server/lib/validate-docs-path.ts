import path from "node:path"
import { cwd } from "@/lib/cwd"

export function validateDocsPath(filePath: string): string {
  const fullPath = path.join(cwd(), filePath)
  const normalizedPath = path.normalize(fullPath)
  const docsPath = path.join(cwd(), "docs")

  if (!normalizedPath.startsWith(docsPath)) {
    throw new Error("Invalid path: Path must be within docs directory")
  }

  return fullPath
}
