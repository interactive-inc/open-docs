import path from "node:path"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import type { DocSchemaRecord } from "@/lib/types"
import type { DocFileReadSystem } from "./doc-file-read-system"
import type { DocFileWriteSystem } from "./doc-file-write-system"
import { DocFrontMatterMdValue } from "./values/doc-front-matter-md-value"
import { DocSchemaValue } from "./values/doc-schema-value"

type Props = {
  reader: DocFileReadSystem
  writer: DocFileWriteSystem
}

/**
 * ドキュメントの正規化とバリデーション
 */
export class DocFileNormalizeSystem {
  private readonly reader: DocFileReadSystem
  private readonly writer: DocFileWriteSystem

  constructor(props: Props) {
    this.reader = props.reader
    this.writer = props.writer
  }

  /**
   * ディレクトリ全体のindex.mdファイルを検証・作成
   */
  async validateDirectories(basePath = ""): Promise<void> {
    const entries = await this.reader.fileSystemInstance.readDirectory(basePath)
    for (const entry of entries) {
      if (entry.startsWith("_")) continue
      const entryPath = basePath ? path.join(basePath, entry) : entry
      const isDirectory = await this.reader.isDirectory(entryPath)
      if (!isDirectory) continue
      const indexFile = await this.reader.readIndexFile(entryPath)
      if (!indexFile) {
        await this.writer.createIndexFile(entryPath)
      }
      await this.validateDirectories(entryPath)
    }
  }

  /**
   * ファイルツリー正規化を実行（結果を消費するだけ）
   */
  async validateFiles(basePath = ""): Promise<void> {
    for await (const _result of this.normalizeFileTree(basePath)) {
      // 結果を消費するだけ（ログは不要）
    }
  }

  /**
   * ディレクトリツリー全体のFrontMatterを再帰的に正規化 (Generator版)
   */
  async *normalizeFileTree(basePath = ""): AsyncGenerator<{
    type: "index" | "file"
    path: string
    isUpdated: boolean
  }> {
    const entries = await this.reader.fileSystemInstance.readDirectory(basePath)

    for (const entry of entries) {
      // アーカイブディレクトリ（「_」で始まる）は除外
      if (entry.startsWith("_")) continue

      const entryPath = path.join(basePath, entry)

      const isDirectory = await this.reader.isDirectory(entryPath)

      if (!isDirectory) continue

      // ディレクトリからスキーマを取得
      let directorySchema: DocSchemaRecord | null = null

      try {
        const indexFileBuilder = await this.reader.readIndexFile(entryPath)
        if (indexFileBuilder) {
          // DocIndexFileBuilderからスキーマを取得
          directorySchema = indexFileBuilder.schema
        }
      } catch {
        // index.mdが存在しない場合はスキーマなし
      }

      const files = this.normalizeDirectoryFiles(entryPath, directorySchema)

      // 現在のディレクトリを正規化
      for await (const result of files) {
        yield result
      }

      const subDirectories = this.normalizeFileTree(entryPath)

      // サブディレクトリを再帰的に処理
      for await (const result of subDirectories) {
        yield result
      }
    }
  }

  /**
   * 単一ディレクトリ内のファイルを正規化 (Generator版)
   */
  private async *normalizeDirectoryFiles(
    directoryPath: string,
    schema: DocSchemaRecord | null,
  ): AsyncGenerator<{
    type: "index" | "file"
    path: string
    isUpdated: boolean
  }> {
    // インデックスファイルを正規化
    try {
      const indexFile = await this.reader.readIndexFile(directoryPath)
      if (indexFile) {
        // インデックスファイルの正規化は省略
        yield { type: "index", path: directoryPath, isUpdated: false }
      }
    } catch {
      // index.mdが存在しない場合はスキップ
    }

    // 通常のMarkdownファイルを正規化
    const markdownFiles = await this.reader.readDirectoryFiles(directoryPath)

    for (const filePath of markdownFiles) {
      // index.mdファイルは正規化対象から除外
      if (filePath.endsWith("index.md")) continue

      const updated = await this.normalizeFile(filePath, schema)
      yield { type: "file", path: filePath, isUpdated: updated }
    }
  }

  /**
   * 単一ファイルのFrontMatterを正規化
   */
  async normalizeFile(
    relativePath: string,
    schema: DocSchemaRecord | null,
  ): Promise<boolean> {
    const content = await this.reader.readContent(relativePath)

    const markdown = new OpenMarkdown(content)
    const originalFrontMatter = markdown.frontMatter.data || {}

    let isUpdated = false
    const normalizedFrontMatter: Record<string, unknown> = {
      ...originalFrontMatter,
    }

    const schemaEntity =
      schema && Object.keys(schema).length > 0
        ? new DocSchemaValue(schema)
        : DocSchemaValue.empty()

    for (const [key, field] of Object.entries(schema || {})) {
      const originalValue = originalFrontMatter[key]
      const defaultValue =
        DocFrontMatterMdValue.generateDefaultValueFromSchemaField(field)

      const convertedValue = schemaEntity.convertValue(
        originalValue,
        field.type,
        defaultValue,
      )

      if (JSON.stringify(originalValue) !== JSON.stringify(convertedValue)) {
        normalizedFrontMatter[key] = convertedValue
        isUpdated = true
      }
    }

    if (isUpdated) {
      const normalizedMarkdown = OpenMarkdown.fromProps({
        frontMatter: normalizedFrontMatter,
        content: markdown.content,
      })

      await this.writer.writeContent(relativePath, normalizedMarkdown.text)
    }

    return isUpdated
  }
}
