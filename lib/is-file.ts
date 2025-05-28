import fs from "node:fs/promises"

/**
 * ファイルパスが実際のファイルかどうかを確認する
 */
export async function isFile(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath)
    return stats.isFile()
  } catch (error) {
    return false
  }
}
