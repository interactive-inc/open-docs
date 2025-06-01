import { factory } from "@/lib/factory"
import { getDocsFiles } from "@/lib/get-docs-files"

// GET /api/files/tree - ファイルツリー取得
export const GET = factory.createHandlers(async (c) => {
  const files = await getDocsFiles()

  return c.json({ files })
})
