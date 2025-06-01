import * as fs from "node:fs"
import * as path from "node:path"
import { factory } from "@/lib/factory"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { validateDocsPath } from "../utils"

const moveFileSchema = z.object({
  sourcePath: z.string(),
  destinationPath: z.string(),
})

// POST /api/files/move - ファイルまたはディレクトリを移動
export const POST = factory.createHandlers(
  zValidator("json", moveFileSchema),
  async (c) => {
    const body = c.req.valid("json")

    const sourceFullPath = validateDocsPath(body.sourcePath)
    const destinationFullPath = validateDocsPath(body.destinationPath)

    // 移動元が存在するか確認
    if (!fs.existsSync(sourceFullPath)) {
      return c.json(
        {
          success: false,
          message: `移動元が存在しません: ${body.sourcePath}`,
        },
        404,
      )
    }

    // 移動先のディレクトリが存在するか確認
    const destinationDir = path.dirname(destinationFullPath)
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true })
    }

    // 移動先に同名のファイルが存在するか確認
    if (fs.existsSync(destinationFullPath)) {
      return c.json(
        {
          success: false,
          message: `移動先に同名のファイルが既に存在します: ${body.destinationPath}`,
        },
        409,
      )
    }

    // ファイルまたはディレクトリの移動
    const isDirectory = fs.statSync(sourceFullPath).isDirectory()

    if (isDirectory) {
      // ディレクトリの場合は再帰的にコピーしてから削除
      copyDirectory(sourceFullPath, destinationFullPath)
      fs.rmSync(sourceFullPath, { recursive: true, force: true })
    } else {
      // ファイルの場合は単純に移動
      fs.renameSync(sourceFullPath, destinationFullPath)
    }

    return c.json({
      success: true,
      message: `${isDirectory ? "ディレクトリ" : "ファイル"}を移動しました: ${body.sourcePath} -> ${body.destinationPath}`,
    })
  },
)

// ディレクトリを再帰的にコピーする関数
function copyDirectory(source: string, destination: string): void {
  // 移動先ディレクトリがなければ作成
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true })
  }

  // ソースディレクトリの内容を取得
  const entries = fs.readdirSync(source, { withFileTypes: true })

  // 各エントリに対して処理
  for (const entry of entries) {
    const srcPath = path.join(source, entry.name)
    const destPath = path.join(destination, entry.name)

    if (entry.isDirectory()) {
      // ディレクトリの場合は再帰的に処理
      copyDirectory(srcPath, destPath)
    } else {
      // ファイルの場合はコピー
      fs.copyFileSync(srcPath, destPath)
    }
  }
}
