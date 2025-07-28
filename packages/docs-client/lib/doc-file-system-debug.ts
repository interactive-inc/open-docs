import { DocFileSystem } from "./doc-file-system"
import { DocPathSystem } from "./doc-path-system"

type FileData = {
  content: string
  modifiedTime: Date
  createdTime: Date
  size: number
}

/**
 * In-memory file system for testing
 */
export class DocFileSystemDebug extends DocFileSystem {
  private files: Map<string, FileData> = new Map()
  private readonly _pathSystem: DocPathSystem

  constructor(props: { basePath: string; pathSystem: DocPathSystem }) {
    super(props)
    this._pathSystem = props.pathSystem
    Object.freeze(this)
  }

  /**
   * PathSystem accessor (for testing)
   */
  getPathSystem() {
    return this._pathSystem
  }

  /**
   * Factory method for testing
   */
  static createWithFiles(props: {
    basePath?: string
    fileContents?: Record<string, string>
  }): DocFileSystemDebug {
    const pathSystem = new DocPathSystem()
    const basePath = props.basePath ?? "/test"
    const fileSystem = new DocFileSystemDebug({ basePath, pathSystem })

    if (props.fileContents) {
      const now = new Date()
      for (const [path, content] of Object.entries(props.fileContents)) {
        fileSystem.files.set(path, {
          content,
          modifiedTime: now,
          createdTime: now,
          size: new TextEncoder().encode(content).length,
        })
      }
    }

    return fileSystem
  }

  override async readFile(filePath: string): Promise<string | null> {
    // Remove 'docs/' prefix if present
    const normalizedPath = filePath.startsWith("docs/")
      ? filePath
      : `docs/${filePath}`
    const file = this.files.get(normalizedPath)
    return file ? file.content : null
  }

  override async writeFile(filePath: string, content: string): Promise<void> {
    const normalizedPath = filePath.startsWith("docs/")
      ? filePath
      : `docs/${filePath}`
    const now = new Date()
    const existing = this.files.get(normalizedPath)

    this.files.set(normalizedPath, {
      content,
      modifiedTime: now,
      createdTime: existing?.createdTime ?? now,
      size: new TextEncoder().encode(content).length,
    })
  }

  override async deleteFile(filePath: string) {
    const normalizedPath = filePath.startsWith("docs/")
      ? filePath
      : `docs/${filePath}`
    try {
      this.files.delete(normalizedPath)
      return null
    } catch (error) {
      return new Error(`Failed to delete file at ${filePath}: ${error}`)
    }
  }

  override async exists(filePath: string): Promise<boolean> {
    // Normalize path
    const normalizedPath = filePath.startsWith("docs/")
      ? filePath
      : `docs/${filePath}`

    if (this.files.has(normalizedPath)) {
      return true
    }

    const dirPath = normalizedPath.endsWith("/")
      ? normalizedPath
      : `${normalizedPath}/`
    for (const path of this.files.keys()) {
      if (path.startsWith(dirPath)) {
        return true
      }
    }

    return false
  }

  override async copyFile(source: string, destination: string): Promise<void> {
    const normalizedSource = source.startsWith("docs/")
      ? source
      : `docs/${source}`
    const normalizedDest = destination.startsWith("docs/")
      ? destination
      : `docs/${destination}`

    const file = this.files.get(normalizedSource)
    if (!file) {
      throw new Error(`Source file not found: ${normalizedSource}`)
    }

    this.files.set(normalizedDest, {
      ...file,
      createdTime: new Date(),
    })
  }

  override async moveFile(source: string, destination: string): Promise<void> {
    const normalizedSource = source.startsWith("docs/")
      ? source
      : `docs/${source}`
    const normalizedDest = destination.startsWith("docs/")
      ? destination
      : `docs/${destination}`

    const file = this.files.get(normalizedSource)
    if (!file) {
      throw new Error(`Source file not found: ${normalizedSource}`)
    }

    this.files.set(normalizedDest, file)
    this.files.delete(normalizedSource)
  }

  async readDirectory(directoryPath: string): Promise<string[]> {
    const dirPath = directoryPath.endsWith("/")
      ? directoryPath
      : `${directoryPath}/`
    const entries = new Set<string>()

    for (const path of this.files.keys()) {
      if (path.startsWith(dirPath)) {
        const relativePath = path.slice(dirPath.length)
        const firstSegment = relativePath.split("/")[0]
        if (firstSegment) {
          entries.add(firstSegment)
        }
      }
    }

    return Array.from(entries).sort()
  }

  async readDirectoryRecursive(directoryPath: string): Promise<string[]> {
    const dirPath = directoryPath.endsWith("/")
      ? directoryPath
      : `${directoryPath}/`
    const files: string[] = []

    for (const path of this.files.keys()) {
      if (path.startsWith(dirPath)) {
        files.push(path)
      }
    }

    return files.sort()
  }

  override async readDirectoryFilePaths(
    directoryPath: string,
  ): Promise<string[]> {
    const dirPath = directoryPath.endsWith("/")
      ? directoryPath
      : `${directoryPath}/`
    const files: string[] = []

    for (const path of this.files.keys()) {
      if (
        path.startsWith(dirPath) &&
        !path.slice(dirPath.length).includes("/")
      ) {
        files.push(path)
      }
    }

    return files.sort()
  }

  override async createDirectory(_directoryPath: string): Promise<void> {}

  async deleteDirectory(directoryPath: string): Promise<void> {
    const dirPath = directoryPath.endsWith("/")
      ? directoryPath
      : `${directoryPath}/`

    for (const path of this.files.keys()) {
      if (path.startsWith(dirPath)) {
        this.files.delete(path)
      }
    }
  }

  override async getFileSize(filePath: string): Promise<number> {
    const normalizedPath = filePath.startsWith("docs/")
      ? filePath
      : `docs/${filePath}`
    const file = this.files.get(normalizedPath)
    if (!file) {
      throw new Error(`File not found: ${normalizedPath}`)
    }
    return file.size
  }

  override async getFileModifiedTime(filePath: string): Promise<Date> {
    const normalizedPath = filePath.startsWith("docs/")
      ? filePath
      : `docs/${filePath}`
    const file = this.files.get(normalizedPath)
    if (!file) {
      throw new Error(`File not found: ${normalizedPath}`)
    }
    return file.modifiedTime
  }

  override async getFileCreatedTime(filePath: string): Promise<Date> {
    const normalizedPath = filePath.startsWith("docs/")
      ? filePath
      : `docs/${filePath}`
    const file = this.files.get(normalizedPath)
    if (!file) {
      throw new Error(`File not found: ${normalizedPath}`)
    }
    return file.createdTime
  }

  override async isDirectory(relativePath: string): Promise<boolean> {
    // In memory system doesn't track directories explicitly
    // Check if any files exist with this prefix
    const normalizedPath = relativePath.startsWith("docs/")
      ? relativePath
      : `docs/${relativePath}`
    const dirPath = normalizedPath.endsWith("/")
      ? normalizedPath
      : `${normalizedPath}/`
    for (const path of this.files.keys()) {
      if (path.startsWith(dirPath)) {
        return true
      }
    }
    return false
  }

  override async isFile(relativePath: string): Promise<boolean> {
    const normalizedPath = relativePath.startsWith("docs/")
      ? relativePath
      : `docs/${relativePath}`
    return this.files.has(normalizedPath)
  }

  /**
   * Get list of entries in directory
   */
  override async readDirectoryFileNames(directoryPath = ""): Promise<string[]> {
    // Normalize path
    const normalizedDir =
      directoryPath === ""
        ? "docs"
        : directoryPath.startsWith("docs/")
          ? directoryPath
          : `docs/${directoryPath}`
    const dirPath = normalizedDir.endsWith("/")
      ? normalizedDir
      : `${normalizedDir}/`
    const entries = new Set<string>()

    for (const path of this.files.keys()) {
      if (path.startsWith(dirPath)) {
        const relativePath = path.slice(dirPath.length)
        const firstSegment = relativePath.split("/")[0]
        if (firstSegment) {
          entries.add(firstSegment)
        }
      }
    }

    return Array.from(entries).sort()
  }

  /**
   * Check if directory exists
   */
  override async directoryExists(relativePath: string): Promise<boolean> {
    return this.isDirectory(relativePath)
  }

  /**
   * Check if file exists
   */
  override async fileExists(relativePath: string): Promise<boolean> {
    return this.isFile(relativePath)
  }

  /**
   * Create directory if it doesn't exist
   */
  override async ensureDirectoryExists(_relativePath: string): Promise<void> {
    // No directory creation needed in in-memory file system
  }

  /**
   * Clear all files
   */
  clear(): void {
    this.files.clear()
  }

  /**
   * Check file existence (for testing)
   */
  hasFile(filePath: string): boolean {
    return this.files.has(filePath)
  }

  /**
   * Get file content (sync version, for testing)
   */
  getFileContent(filePath: string): string | undefined {
    return this.files.get(filePath)?.content
  }

  /**
   * Get all file paths (for testing)
   */
  getAllFilePaths(): string[] {
    return Array.from(this.files.keys()).sort()
  }

  /**
   * Get file count (for testing)
   */
  getFileCount(): number {
    return this.files.size
  }

  /**
   * Setup test data
   */
  setupTestFiles(files: Record<string, string>): void {
    const now = new Date()
    for (const [path, content] of Object.entries(files)) {
      this.files.set(path, {
        content,
        modifiedTime: now,
        createdTime: now,
        size: new TextEncoder().encode(content).length,
      })
    }
  }
}
