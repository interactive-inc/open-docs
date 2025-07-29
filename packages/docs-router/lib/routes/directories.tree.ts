import { factory } from "@/utils/factory"

/**
 * ファイルツリーを取得する
 * @returns ファイルツリー情報
 */
export const GET = factory.createHandlers(async (c) => {
  const directoryTree = await c.var.client.directoryTree()

  return c.json(directoryTree)
})
