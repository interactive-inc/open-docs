import { promises as fs } from "node:fs"
import path from "node:path"

const PRODUCTS_DIR = path.join(process.cwd(), "docs", "products")

const OUTPUT_CSV = path.join(process.cwd(), "data.csv")

const targetDirectories = ["features", "pages"]

const files = await findFiles(PRODUCTS_DIR, targetDirectories)

await createCsv(files)

/**
 * 特定のディレクトリ（featuresまたはpages）内のファイルを再帰的に探索
 */
async function findFiles(dir: string, targetDirs: string[]): Promise<string[]> {
  const allFiles: string[] = []
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (!entry.isDirectory()) {
      continue
    }

    if (targetDirs.includes(entry.name)) {
      // これがtarget directory (featuresまたはpages)の場合、その中のファイルを取得
      const files = await collectMdFiles(fullPath)
      allFiles.push(...files)
      continue
    }

    // それ以外のディレクトリは再帰的に探索
    const nestedFiles = await findFiles(fullPath, targetDirs)
    allFiles.push(...nestedFiles)
  }

  return allFiles
}

/**
 * 指定されたディレクトリ内の全てのMarkdownファイルを収集
 */
async function collectMdFiles(dir: string): Promise<string[]> {
  const files: string[] = []

  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      // ディレクトリの場合は再帰的に探索
      const subDirFiles = await collectMdFiles(fullPath)
      files.push(...subDirFiles)
      continue
    }

    // ディレクトリでない場合の処理
    if (!entry.isFile()) {
      continue
    }

    if (!entry.name.endsWith(".md")) {
      continue
    }

    if (entry.name === "README.md") {
      continue
    }

    // 全ての条件を満たすMarkdownファイルの場合
    const relativePath = path.relative(PRODUCTS_DIR, fullPath)
    files.push(relativePath)
  }

  return files
}

/**
 * ファイルパスからディレクトリタイプを判定する
 */
function getDirectoryType(parts: string[]): string {
  if (parts.includes("features")) {
    return "features"
  }

  if (parts.includes("pages")) {
    return "pages"
  }

  return "その他"
}

/**
 * CSVファイルの作成
 */
async function createCsv(files: string[]): Promise<void> {
  const csvRows = files.map((file) => {
    const parts = file.split(path.sep)
    const product = parts[0] ?? ""
    const directory = getDirectoryType(parts)
    const filename = parts[parts.length - 1] ?? ""
    const slug = filename.replace(".md", "")
    return `${product},${directory},${slug}`
  })

  const sortedRows = csvRows.toSorted()

  const csvContent = sortedRows.join("\n")

  await fs.writeFile(OUTPUT_CSV, csvContent, "utf8")
}
