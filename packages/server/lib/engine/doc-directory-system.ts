import path from "node:path"
import { zDocFileIndexFrontMatter } from "@/lib/models"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import type { DocFileArchiveSystem } from "./doc-file-archive-system"
import type { DocFileReadSystem } from "./doc-file-read-system"
import type { DocFileRelationSystem } from "./doc-file-relation-system"
import type { DocFileSystem } from "./doc-file-system"
import type { DocFileWriteSystem } from "./doc-file-write-system"
import { DocDirectoryEntity } from "./entities/doc-directory-entity"
import type { DocFileMdEntity } from "./entities/doc-file-md-entity"

type Props = {
  fileSystem: DocFileSystem
  reader: DocFileReadSystem
  relationManager: DocFileRelationSystem
  archiveManager: DocFileArchiveSystem
  writer: DocFileWriteSystem
}

/**
 * ディレクトリ処理を担当するシステム
 */
export class DocDirectorySystem {
  private readonly fileSystem: DocFileSystem
  private readonly reader: DocFileReadSystem
  private readonly relationManager: DocFileRelationSystem
  private readonly archiveManager: DocFileArchiveSystem
  private readonly writer: DocFileWriteSystem

  constructor(props: Props) {
    this.fileSystem = props.fileSystem
    this.reader = props.reader
    this.relationManager = props.relationManager
    this.archiveManager = props.archiveManager
    this.writer = props.writer
  }

  /**
   * ディレクトリデータを取得
   */
  async readDirectory(relativePath: string): Promise<DocDirectoryEntity> {
    // パスの存在確認
    if (!(await this.reader.exists(relativePath))) {
      throw new Error(`ディレクトリが見つかりません: ${relativePath}`)
    }

    // ディレクトリであることを確認
    if (!(await this.reader.isDirectory(relativePath))) {
      throw new Error(
        `指定されたパスはディレクトリではありません: ${relativePath}`,
      )
    }

    // アーカイブディレクトリの場合は親ディレクトリを対象とする
    const targetPath = this.archiveManager.isArchiveDirectory(relativePath)
      ? relativePath.split("/").slice(0, -1).join("/") || ""
      : relativePath

    const indexFileEntity = await this.reader.readIndexFile(targetPath)

    const fullPath = this.fileSystem.resolve(targetPath)

    if (indexFileEntity === null) {
      throw new Error(`Index file not found at path: ${fullPath}`)
    }

    const allFiles = await this.reader.readAllFiles(targetPath)

    const markdownFilePaths = await this.reader.readDirectoryFiles(targetPath)

    // リレーション情報を取得
    const relations =
      await this.relationManager.getRelationsFromIndexFile(indexFileEntity)

    const archiveHandling =
      await this.archiveManager.readDirectoryWithArchiveHandling(targetPath)

    const archivedFilesList =
      await this.archiveManager.getArchivedFiles(targetPath)

    const archivedFiles: DocFileMdEntity[] = []

    // archivedFilesをDocFileEntityに変換（.mdファイルのみ）
    for (const archivedFile of archivedFilesList) {
      if (archivedFile.extension !== "md") continue
      const fileExists = await this.fileSystem.exists(archivedFile.path)
      if (!fileExists) continue
      const docFile = await this.reader.readFile(archivedFile.path)
      archivedFiles.push(docFile)
    }

    return new DocDirectoryEntity({
      indexFile: indexFileEntity.toJson(),
      files: allFiles.markdownFiles.map((file) => file.toJson()),
      otherFiles: allFiles.otherFiles,
      archivedFiles: archivedFiles.map((file) => file.toJson()),
      markdownFilePaths,
      relations: relations.map((entity) => entity.toJson()),
      hasArchive: archiveHandling.hasArchive,
      archiveFileCount: archiveHandling.archiveFiles.length,
      cwd: process.cwd(),
    })
  }

  /**
   * ディレクトリのindex.mdを更新
   */
  async updateIndexFile(
    directoryPath: string,
    updates: {
      title?: string | null
      description?: string | null
      properties?: Record<string, unknown> | null
    },
  ): Promise<void> {
    const indexPath = path.join(directoryPath, "index.md")

    // index.mdの存在確認
    if (!(await this.reader.exists(indexPath))) {
      throw new Error(`index.mdが見つかりません: ${indexPath}`)
    }

    // 現在のindex.mdの内容を取得
    const content = await this.reader.readContent(indexPath)
    const directory = await this.readDirectory(directoryPath)
    const currentFrontMatter = directory.indexFile.frontMatter

    let openMd = new OpenMarkdown(content)

    // タイトルの更新
    openMd = this.updateTitle(openMd, updates.title)

    // 説明の更新
    openMd = this.updateDescription(openMd, updates.description, directoryPath)

    // プロパティの更新
    openMd = this.updateProperties(
      openMd,
      updates.properties,
      currentFrontMatter,
    )

    // ファイルに書き込み
    await this.writer.writeContent(indexPath, openMd.text)
  }

  /**
   * タイトルを更新
   */
  private updateTitle(
    openMd: OpenMarkdown,
    title: string | null | undefined,
  ): OpenMarkdown {
    if (title !== null && title !== undefined) {
      return openMd.withTitle(title)
    }
    return openMd
  }

  /**
   * 説明を更新
   */
  private updateDescription(
    openMd: OpenMarkdown,
    description: string | null | undefined,
    directoryPath: string,
  ): OpenMarkdown {
    if (description !== null && description !== undefined) {
      // H1がない場合のデフォルトタイトルを取得（ディレクトリ名から）
      const dirName = path.basename(directoryPath)
      const defaultTitle = dirName === "index" ? "概要" : dirName
      return openMd.withDescription(description, defaultTitle)
    }
    return openMd
  }

  /**
   * プロパティ（フロントマター）を更新
   */
  private updateProperties(
    openMd: OpenMarkdown,
    properties: Record<string, unknown> | null | undefined,
    currentFrontMatter: Record<string, unknown>,
  ): OpenMarkdown {
    if (properties !== null && properties !== undefined) {
      const updatedFrontMatter = this.mergeFrontMatter(
        properties,
        currentFrontMatter,
      )
      const cleanedFrontMatter = this.removeUndefinedValues(updatedFrontMatter)
      return openMd.withFrontMatter(cleanedFrontMatter)
    }
    return openMd
  }

  /**
   * フロントマターをマージ
   */
  private mergeFrontMatter(
    properties: Record<string, unknown>,
    currentFrontMatter: Record<string, unknown>,
  ): Record<string, unknown> {
    let updatedFrontMatter: Record<string, unknown> = {
      ...currentFrontMatter,
      // schemaが存在しない場合は空オブジェクトを設定
      schema: currentFrontMatter.schema ?? {},
    }

    // iconのみが渡された場合は、iconだけを更新
    if ("icon" in properties && !("schema" in properties)) {
      updatedFrontMatter = {
        ...updatedFrontMatter,
        icon: properties.icon,
      }
    } else {
      // 部分的な更新を許可するため、既存のfrontMatterとマージ
      const mergedProperties = {
        icon: properties.icon ?? updatedFrontMatter.icon ?? "",
        schema: properties.schema ?? updatedFrontMatter.schema ?? {},
      }
      const validatedProperties =
        zDocFileIndexFrontMatter.parse(mergedProperties)
      updatedFrontMatter = {
        ...updatedFrontMatter,
        ...validatedProperties,
      }
    }

    return updatedFrontMatter
  }

  /**
   * undefined値を削除
   */
  private removeUndefinedValues(
    obj: Record<string, unknown>,
  ): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = value
      }
    }
    return cleaned
  }
}
