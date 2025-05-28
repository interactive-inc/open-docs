import fs from "node:fs/promises"
import path from "node:path"
import type { z } from "zod"
import { createFeatureRecords } from "../lib/create-feature-records.js"
import { createPageRecords } from "../lib/create-page-records.js"
import { parseMarkdown } from "../lib/markdown/parse-markdown.js"
import { toFrontMatterText } from "../lib/markdown/to-front-matter-text.js"
import { updateFrontMatter } from "../lib/markdown/update-front-matter.js"
import { vData } from "../lib/models/data.js"
import { zFeatureFrontMatter } from "../lib/models/feature-front-matter.js"
import { zPageFrontMatter } from "../lib/models/page-front-matter.js"
import { readMarkdownFiles } from "../lib/read-markdown-files.js"
import { toFeatureFrontMatter } from "../lib/to-feature-front-matter.js"
import { toPageFrontMatter } from "../lib/to-page-front-matter.js"

const CWD = `${__dirname}/..`

export class JsonCommand {
  private getBaseDirectory() {
    return path.join(CWD, "docs/products")
  }

  private getProjectPath(project: string) {
    return path.join(this.getBaseDirectory(), project)
  }

  private getDataJsonPath(project: string) {
    return path.join(this.getProjectPath(project), "data.json")
  }

  /**
   * マークダウンファイルのフロントマターを更新する共通関数
   */
  private async writeMarkdownFiles<T, S>(props: {
    directory: string
    dataItems: T[]
    schema: z.ZodType<S>
    prepareFrontMatter: (data: T) => Record<string, unknown>
    findDataItem: (dataItems: T[], key: string) => T | undefined
  }): Promise<void> {
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

  async generateProjectJson(project: string) {
    const projectPath = this.getProjectPath(project)

    const pages = await createPageRecords({
      directory: path.join(projectPath, "pages"),
    })

    const features = await createFeatureRecords({
      directory: path.join(projectPath, "features"),
    })

    const data = { pages, features }
    const text = JSON.stringify(data, null, 2)
    const outputPath = this.getDataJsonPath(project)

    await Bun.file(outputPath).write(text)

    return data
  }

  async applyProjectJson(project: string) {
    try {
      const dataJsonPath = this.getDataJsonPath(project)
      const rawDataJson = await Bun.file(dataJsonPath).json()
      const dataJson = vData.parse(rawDataJson)

      const projectPath = this.getProjectPath(project)
      const pagesDirectory = path.join(projectPath, "pages")
      const featuresDirectory = path.join(projectPath, "features")

      // ページのマークダウンファイルを更新
      await this.writeMarkdownFiles({
        directory: pagesDirectory,
        dataItems: dataJson.pages,
        schema: zPageFrontMatter,
        prepareFrontMatter: toPageFrontMatter,
        findDataItem: (items, key) => items.find((item) => item.id === key),
      })

      // 機能のマークダウンファイルを更新
      await this.writeMarkdownFiles({
        directory: featuresDirectory,
        dataItems: dataJson.features,
        schema: zFeatureFrontMatter,
        prepareFrontMatter: toFeatureFrontMatter,
        findDataItem: (items, key) => items.find((item) => item.id === key),
      })

      return dataJson
    } catch (error) {
      console.error("JSON適用エラー:", error)
      return null
    }
  }

  async getProjectJson(project: string) {
    const dataJsonPath = this.getDataJsonPath(project)
    try {
      const rawDataJson = await Bun.file(dataJsonPath).json()
      return vData.parse(rawDataJson)
    } catch (error) {
      return null
    }
  }

  async updateProjectJson(project: string, data: unknown) {
    try {
      const validatedData = vData.parse(data)
      const text = JSON.stringify(validatedData, null, 2)
      const outputPath = this.getDataJsonPath(project)
      await Bun.file(outputPath).write(text)
      return validatedData
    } catch (error) {
      return null
    }
  }
}
