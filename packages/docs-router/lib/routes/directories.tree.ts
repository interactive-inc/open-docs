import { docClient } from "../utils/doc-client"
import { factory } from "../utils/factory"

/**
 * ファイルツリーを取得する
 * @returns ファイルツリー情報
 */
export const GET = factory.createHandlers(async (c) => {
  const client = docClient()

  const directoryTree = await client.directoryTree()

  return c.json(directoryTree)
})
