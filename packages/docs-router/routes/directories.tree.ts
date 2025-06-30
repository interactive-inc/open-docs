import type { DocTreeDirectoryNode } from "../../docs/lib"
import { docClient } from "../lib/doc-client"
import { factory } from "../lib/factory"

/**
 * ファイルツリーを取得する
 * @returns ファイルツリー情報
 */
export const GET = factory.createHandlers(async (c) => {
  const client = docClient()

  const directoryTree: DocTreeDirectoryNode[] = await client.directoryTree()

  return c.json(directoryTree)
})
