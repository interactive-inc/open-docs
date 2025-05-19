import fs from "node:fs/promises"
import type { z } from "zod"
import { parseMarkdown } from "./markdown/parse-markdown"
import { toFrontMatterText } from "./markdown/to-front-matter-text"
import { updateFrontMatter } from "./markdown/update-front-matter"
import { readMarkdownFiles } from "./read-markdown-files"

type Props<T, S> = {
  directory: string
  dataItems: T[]
  schema: z.ZodType<S>
  prepareFrontMatter: (data: T) => Record<string, unknown>
  findDataItem: (dataItems: T[], key: string) => T | undefined
}

/**
 * マークダウンファイルのフロントマターをスキーマに沿って更新する共通関数
 */
export async function writeMarkdownFiles<T, S>(
  props: Props<T, S>,
): Promise<void> {
  const files = await readMarkdownFiles(props.directory)

  for (const file of files) {
    const filePath = `${props.directory}/${file}`

    // ファイル名からデータのキーを取得
    const dataKey = file.replace(".md", "")

    // データアイテムを検索
    const dataItem = props.findDataItem(props.dataItems, dataKey)

    if (!dataItem) continue

    // ファイル内容を読み込む
    const fileContent = await fs.readFile(filePath, "utf-8")

    // フロントマターとコンテンツを分離
    const markdown = parseMarkdown(fileContent)

    // データからフロントマターを準備
    const frontMatterData = props.prepareFrontMatter(dataItem)

    // スキーマでバリデーション
    props.schema.parse(frontMatterData)

    if (markdown.frontMatter === null) {
      // フロントマターがない場合は新規作成
      const newFrontMatter = toFrontMatterText(frontMatterData)
      await fs.writeFile(
        filePath,
        `---\n${newFrontMatter}\n---\n\n${markdown.content.trim()}\n`,
      )
      continue
    }

    // 現在のフロントマターはmarkdown.frontMatterから直接取得
    const currentFrontMatter = markdown.frontMatter

    // フロントマターを更新
    const updatedFrontMatter = updateFrontMatter(
      currentFrontMatter,
      frontMatterData,
    )

    // 更新後のフロントマターをバリデーション
    props.schema.parse(updatedFrontMatter)

    // 更新されたフロントマターをYAML形式に変換
    const newFrontMatterText = toFrontMatterText(updatedFrontMatter)

    // ファイルに書き込む
    await fs.writeFile(
      filePath,
      `---\n${newFrontMatterText}\n---\n\n${markdown.content.trim()}\n`,
    )
  }
}
