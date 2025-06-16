import path from "node:path"
import { DocEngine } from "@/lib/engine/doc-engine"
import { factory } from "@/lib/system/factory"

/**
 * ファイルツリーを取得する
 * @returns ファイルツリー情報
 */
export const GET = factory.createHandlers(async (c) => {
  const docsEngine = new DocEngine({
    basePath: path.join(process.cwd(), "docs"),
    indexFileName: null,
    readmeFileName: null,
  })

  await docsEngine.init()

  const files = await docsEngine.getFileTree()

  return c.json(files)
})
