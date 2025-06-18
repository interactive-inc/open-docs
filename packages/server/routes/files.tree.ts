import path from "node:path"
import { cwd } from "@/lib/cwd"
import { DocEngine } from "@/lib/engine/doc-engine"
import { factory } from "@/lib/factory"

/**
 * ファイルツリーを取得する
 * @returns ファイルツリー情報
 */
export const GET = factory.createHandlers(async (c) => {
  const engine = new DocEngine({
    basePath: path.join(cwd(), "docs"),
    indexFileName: null,
    readmeFileName: null,
  })

  await engine.validateDirectories()

  await engine.validateFiles()

  const files = await engine.getFileTree()

  return c.json(files)
})
