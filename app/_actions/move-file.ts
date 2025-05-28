"use server"

import fs from "node:fs"
import path from "node:path"
import { revalidatePath } from "next/cache"

type MoveFileProps = {
  sourcePath: string
  destinationPath: string
}

export async function moveFile(
  props: MoveFileProps,
): Promise<{ success: boolean; message: string }> {
  try {
    const sourceFullPath = path.join(process.cwd(), props.sourcePath)
    const destinationFullPath = path.join(process.cwd(), props.destinationPath)

    // 移動元が存在するか確認
    if (!fs.existsSync(sourceFullPath)) {
      return {
        success: false,
        message: `移動元が存在しません: ${props.sourcePath}`,
      }
    }

    // 移動先のディレクトリが存在するか確認
    const destinationDir = path.dirname(destinationFullPath)
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true })
    }

    // 移動先に同名のファイルが存在するか確認
    if (fs.existsSync(destinationFullPath)) {
      return {
        success: false,
        message: `移動先に同名のファイルが既に存在します: ${props.destinationPath}`,
      }
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

    // キャッシュを更新
    revalidatePath("/files")

    return {
      success: true,
      message: `${isDirectory ? "ディレクトリ" : "ファイル"}を移動しました: ${props.sourcePath} -> ${props.destinationPath}`,
    }
  } catch (error) {
    console.error("ファイル移動エラー:", error)
    return {
      success: false,
      message: `エラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

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
