import type { DocClient } from "@interactive-inc/docs-client"
import { HTTPException } from "hono/http-exception"

/**
 * ディレクトリのindex.mdを読み取り、存在しなければ作成して返す
 */
export async function initIndexFile(dirPath: string, client: DocClient) {
  const mdIndexRef = client.directory(dirPath, {}).indexFile()

  const hasIndex = await mdIndexRef.exists()

  if (hasIndex) {
    const entity = await mdIndexRef.read()
    if (entity instanceof Error) {
      throw new HTTPException(500, { message: entity.message })
    }
    return null
  }

  const indexFile = mdIndexRef.empty()

  const result = await mdIndexRef.write(indexFile)

  if (result instanceof Error) {
    throw new HTTPException(500, { message: result.message })
  }

  return null
}
