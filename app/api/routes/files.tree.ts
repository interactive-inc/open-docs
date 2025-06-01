import { factory } from "@/lib/factory"
import { getDocsFiles } from "@/lib/get-docs-files"
import { zAppFileTree } from "@/lib/models"

// GET /api/files/tree - ファイルツリー取得
export const GET = factory.createHandlers(async (c) => {
  const files = await getDocsFiles()

  const response = zAppFileTree.parse({ files })
  return c.json(response)
})
