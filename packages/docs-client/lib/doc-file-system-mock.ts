import { DocFileSystem } from "./doc-file-system"
import { DocPathSystem } from "./doc-path-system"

type FileData = {
  content: string
  modifiedTime: Date
  createdTime: Date
  size: number
}

// 仮想ディレクトリ構造
const mockDirectoryData = {
  "docs/index.md": `---
icon: 📚
---

# Documentation

Welcome to the documentation!`,
  "docs/guide/index.md": `---
icon: 📖
---

# Guide

This is a guide.`,
  "docs/guide/getting-started.md": `# Getting Started

Let's get started!`,
  "docs/guide/advanced.md": `# Advanced

Advanced topics here.`,
  "docs/api/index.md": `---
icon: 🔧
---

# API

API documentation.`,
  "docs/api/reference.md": `# API Reference

Complete API reference.`,
}

/**
 * In-memory file system for testing
 */
export class DocFileSystemMock extends DocFileSystem {
  private files: Map<string, FileData> = new Map()
  private readonly _pathSystem: DocPathSystem

  constructor(props: { basePath: string; pathSystem: DocPathSystem }) {
    super(props)
    this._pathSystem = props.pathSystem

    // mockDirectoryDataでfilesを初期化
    this.setupTestFiles(mockDirectoryData)

    Object.freeze(this)
  }

  /**
   * PathSystem accessor (for testing)
   */
  getPathSystem() {
    return this._pathSystem
  }

  /**
   * Create instance (mock data is automatically loaded)
   */
  static create(basePath = "/test"): DocFileSystemMock {
    const pathSystem = new DocPathSystem()
    return new DocFileSystemMock({ basePath, pathSystem })
  }

  /**
   * Factory method for testing
   */
  static createWithFiles(props: {
    basePath?: string
    fileContents?: Record<string, string>
  }): DocFileSystemMock {
    const pathSystem = new DocPathSystem()
    const basePath = props.basePath ?? "/test"
    const fileSystem = new DocFileSystemMock({ basePath, pathSystem })

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

  override async readFile(filePath: string): Promise<string | null | Error> {
    try {
      // Remove 'docs/' prefix if present
      const normalizedPath = filePath.startsWith("docs/")
        ? filePath
        : `docs/${filePath}`
      const file = this.files.get(normalizedPath)
      return file ? file.content : null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to read file at ${filePath}`)
    }
  }

  override async writeFile(
    filePath: string,
    content: string,
  ): Promise<Error | null> {
    try {
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
      return null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to write file at ${filePath}`)
    }
  }

  override async deleteFile(filePath: string): Promise<Error | null> {
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

  override async copyFile(
    source: string,
    destination: string,
  ): Promise<Error | null> {
    try {
      const normalizedSource = source.startsWith("docs/")
        ? source
        : `docs/${source}`
      const normalizedDest = destination.startsWith("docs/")
        ? destination
        : `docs/${destination}`

      const file = this.files.get(normalizedSource)
      if (!file) {
        return new Error(`Source file not found: ${normalizedSource}`)
      }

      this.files.set(normalizedDest, {
        ...file,
        createdTime: new Date(),
      })
      return null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to copy file from ${source} to ${destination}`)
    }
  }

  override async moveFile(
    source: string,
    destination: string,
  ): Promise<Error | null> {
    try {
      const normalizedSource = source.startsWith("docs/")
        ? source
        : `docs/${source}`
      const normalizedDest = destination.startsWith("docs/")
        ? destination
        : `docs/${destination}`

      const file = this.files.get(normalizedSource)
      if (!file) {
        return new Error(`Source file not found: ${normalizedSource}`)
      }

      this.files.set(normalizedDest, file)
      this.files.delete(normalizedSource)
      return null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to move file from ${source} to ${destination}`)
    }
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
  ): Promise<string[] | Error> {
    try {
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
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to read directory file paths at ${directoryPath}`)
    }
  }

  override async createDirectory(
    _directoryPath: string,
  ): Promise<Error | null> {
    // No directory creation needed in in-memory file system
    return null
  }

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

  override async getFileSize(filePath: string): Promise<number | Error> {
    try {
      const normalizedPath = filePath.startsWith("docs/")
        ? filePath
        : `docs/${filePath}`
      const file = this.files.get(normalizedPath)
      if (!file) {
        return new Error(`File not found: ${normalizedPath}`)
      }
      return file.size
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to get file size at ${filePath}`)
    }
  }

  override async getFileModifiedTime(filePath: string): Promise<Date | Error> {
    try {
      const normalizedPath = filePath.startsWith("docs/")
        ? filePath
        : `docs/${filePath}`
      const file = this.files.get(normalizedPath)
      if (!file) {
        return new Error(`File not found: ${normalizedPath}`)
      }
      return file.modifiedTime
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to get file modified time at ${filePath}`)
    }
  }

  override async getFileCreatedTime(filePath: string): Promise<Date | Error> {
    try {
      const normalizedPath = filePath.startsWith("docs/")
        ? filePath
        : `docs/${filePath}`
      const file = this.files.get(normalizedPath)
      if (!file) {
        return new Error(`File not found: ${normalizedPath}`)
      }
      return file.createdTime
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to get file created time at ${filePath}`)
    }
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
  override async readDirectoryFileNames(
    directoryPath = "",
  ): Promise<string[] | Error> {
    try {
      // Normalize path
      const normalizedDir =
        directoryPath === ""
          ? "docs"
          : directoryPath === "docs"
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
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to read directory at ${directoryPath}`)
    }
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
  override async ensureDirectoryExists(
    _relativePath: string,
  ): Promise<Error | null> {
    // No directory creation needed in in-memory file system
    return null
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
