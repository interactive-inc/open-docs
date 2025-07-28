import type { DocFileSystem } from "./doc-file-system"
import type { DocPathSystem } from "./doc-path-system"
import { DocFileMdEntity } from "./entities/doc-file-md-entity"
import type { DocRelation } from "./types"
import { DocFileMdContentValue } from "./values/doc-file-md-content-value"
import { DocFilePathValue } from "./values/doc-file-path-value"
import { DocRelationFileValue } from "./values/doc-relation-file-value"
import { DocRelationValue } from "./values/doc-relation-value"

type Props = {
  filePath: string
  fileSystem: DocFileSystem
  pathSystem: DocPathSystem
}

/**
 * Relation file reference
 */
export class DocFileRelationReference {
  private readonly pathSystem: DocPathSystem

  constructor(private readonly props: Props) {
    this.pathSystem = props.pathSystem
    Object.freeze(this)
  }

  get fileSystem(): DocFileSystem {
    return this.props.fileSystem
  }

  get basePath(): string {
    return this.fileSystem.getBasePath()
  }

  /**
   * Relation path
   */
  get path(): string {
    return this.props.filePath
  }

  /**
   * Full path
   */
  get fullPath(): string {
    return this.pathSystem.join(
      this.fileSystem.getBasePath(),
      this.props.filePath,
    )
  }

  async read(): Promise<DocRelationValue | null> {
    const files = await this.readFiles()

    return new DocRelationValue({
      path: this.path,
      files: files.map((value) => value.toJson()),
    } satisfies DocRelation)
  }

  /**
   * Read list of relation files
   */
  async readFiles(): Promise<DocRelationFileValue[]> {
    const exists = await this.fileSystem.exists(this.path)

    if (!exists) {
      return []
    }

    const filePaths = await this.fileSystem.readDirectoryFilePaths(this.path)

    const files: DocRelationFileValue[] = []

    for (const filePath of filePaths) {
      const file = await this.readFile(filePath)
      if (file === null) continue
      files.push(file)
    }

    return files
  }

  /**
   * Read single relation file
   */
  async readFile(filePath: string): Promise<DocRelationFileValue | null> {
    if (filePath.includes("index.md")) {
      return null
    }

    const content = await this.fileSystem.readFile(filePath)

    if (content === null) {
      return null
    }

    const contentValue = DocFileMdContentValue.fromMarkdown(content, {})

    const pathValue = DocFilePathValue.fromPathWithSystem(
      filePath,
      this.pathSystem,
      this.basePath,
    )

    const fileEntity = new DocFileMdEntity(
      {
        type: "markdown",
        content: contentValue.value,
        path: pathValue.value,
        isArchived: false,
      },
      {},
    )

    return DocRelationFileValue.from(filePath, fileEntity.value.content.title)
  }

  /**
   * Check if file exists
   */
  async exists(slug: string): Promise<boolean> {
    const filePath = `${this.path}/${slug}.md`
    return this.fileSystem.exists(filePath)
  }

  /**
   * Get list of file names (without extension)
   */
  async readSlugs(): Promise<string[]> {
    const files = await this.readFiles()

    return files.map((file) => file.id)
  }

  /**
   * Get file count
   */
  async count(): Promise<number> {
    const files = await this.readFiles()

    return files.length
  }

  /**
   * Check if empty
   */
  async isEmpty(): Promise<boolean> {
    const count = await this.count()

    return count === 0
  }
}
