import * as fs from "node:fs/promises"
import { DocPathSystem } from "./doc-path-system"

type Props = {
  basePath: string
  pathSystem?: DocPathSystem
}

/**
 * File system wrapper
 */
export class DocFileSystem {
  private readonly basePath: string
  private readonly pathSystem: DocPathSystem

  constructor(props: Props) {
    this.basePath = props.basePath
    this.pathSystem = props.pathSystem ?? new DocPathSystem()
  }

  /**
   * Read file content at the specified path
   */
  async readFile(relativePath: string): Promise<string | null> {
    const exists = await this.exists(relativePath)

    if (!exists) return null

    const fullPath = this.pathSystem.join(this.basePath, relativePath)

    try {
      return await fs.readFile(fullPath, "utf-8")
    } catch {
      return null
    }
  }

  /**
   * Write content to file at the specified path (creates directory if needed)
   */
  async writeFile(relativePath: string, content: string): Promise<void> {
    const fullPath = this.pathSystem.join(this.basePath, relativePath)
    const dirPath = this.pathSystem.dirname(fullPath)

    try {
      await fs.mkdir(dirPath, { recursive: true })
      await fs.writeFile(fullPath, content, "utf-8")
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error(`Failed to write file at ${fullPath}`)
    }
  }

  /**
   * Delete file at the specified path
   */
  async deleteFile(relativePath: string): Promise<Error | null> {
    try {
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      await fs.unlink(fullPath)
      return null
    } catch (error) {
      return new Error(`Failed to delete file at ${relativePath}: ${error}`)
    }
  }

  /**
   * Get file name from path
   */
  readFileName(relativePath: string): string {
    return this.pathSystem.basename(relativePath)
  }

  /**
   * Get file extension from path
   */
  readFileExtension(relativePath: string): string {
    return this.pathSystem.extname(relativePath)
  }

  /**
   * Get directory path where the file exists
   */
  readFileDirectory(relativePath: string): string {
    return this.pathSystem.dirname(relativePath)
  }

  /**
   * Get list of entries in directory
   */
  async readDirectoryFileNames(relativePath = ""): Promise<string[]> {
    const fullPath = this.pathSystem.join(this.basePath, relativePath)

    try {
      return await fs.readdir(fullPath)
    } catch {
      return []
    }
  }

  async readDirectoryFilePaths(relativePath: string): Promise<string[]> {
    const fileNames = await this.readDirectoryFileNames(relativePath)

    return fileNames.map((fileName) =>
      this.pathSystem.join(relativePath, fileName),
    )
  }

  /**
   * Check if path is a directory
   */
  async isDirectory(relativePath: string): Promise<boolean> {
    try {
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      const stats = await fs.stat(fullPath)
      return stats.isDirectory()
    } catch {
      return false
    }
  }

  /**
   * Check if path is a file
   */
  async isFile(relativePath: string): Promise<boolean> {
    try {
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      const stats = await fs.stat(fullPath)
      return stats.isFile()
    } catch {
      return false
    }
  }

  /**
   * Check if file or directory exists
   */
  async exists(relativePath: string): Promise<boolean> {
    try {
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      await fs.access(fullPath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if directory exists
   */
  async directoryExists(relativePath: string): Promise<boolean> {
    return this.isDirectory(relativePath)
  }

  /**
   * Check if file exists
   */
  async fileExists(relativePath: string): Promise<boolean> {
    return this.isFile(relativePath)
  }

  /**
   * Get base path
   */
  getBasePath(): string {
    return this.basePath
  }

  /**
   * Convert relative path to absolute path
   */
  resolve(relativePath: string): string {
    return this.pathSystem.join(this.basePath, relativePath)
  }

  /**
   * Create directory
   */
  async createDirectory(relativePath: string): Promise<void> {
    const fullPath = this.pathSystem.join(this.basePath, relativePath)
    await fs.mkdir(fullPath, { recursive: true })
  }

  /**
   * Get file size in bytes
   */
  async getFileSize(relativePath: string): Promise<number> {
    const fullPath = this.pathSystem.join(this.basePath, relativePath)
    const stats = await fs.stat(fullPath)
    return stats.size
  }

  /**
   * Create directory if it doesn't exist
   */
  async ensureDirectoryExists(relativePath: string): Promise<void> {
    if (!(await this.exists(relativePath))) {
      await this.createDirectory(relativePath)
    }
  }

  /**
   * Copy file
   */
  async copyFile(sourcePath: string, destinationPath: string): Promise<void> {
    const sourceFullPath = this.pathSystem.join(this.basePath, sourcePath)
    const destFullPath = this.pathSystem.join(this.basePath, destinationPath)
    await fs.copyFile(sourceFullPath, destFullPath)
  }

  /**
   * Move file
   */
  async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
    const sourceFullPath = this.pathSystem.join(this.basePath, sourcePath)
    const destFullPath = this.pathSystem.join(this.basePath, destinationPath)
    await fs.rename(sourceFullPath, destFullPath)
  }

  /**
   * Get file last modified time
   */
  async getFileModifiedTime(relativePath: string): Promise<Date> {
    const fullPath = this.pathSystem.join(this.basePath, relativePath)
    const stats = await fs.stat(fullPath)
    return stats.mtime
  }

  /**
   * Get file creation time
   */
  async getFileCreatedTime(relativePath: string): Promise<Date> {
    const fullPath = this.pathSystem.join(this.basePath, relativePath)
    const stats = await fs.stat(fullPath)
    return stats.birthtime
  }
}
