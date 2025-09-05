import * as fs from "node:fs/promises"
import { DocPathSystem } from "./doc-path-system"
import type { DocFileSystemReadType, DocFileSystemWriteType } from "./types"

type Props = {
  basePath: string
  pathSystem?: DocPathSystem
  reader?: DocFileSystemReadType
}

/**
 * Write-only file system implementation
 */
export class DocFileSystemWrite implements DocFileSystemWriteType {
  protected readonly basePath: string
  protected readonly pathSystem: DocPathSystem
  private readonly reader?: DocFileSystemReadType

  constructor(props: Props) {
    this.basePath = props.basePath
    this.pathSystem = props.pathSystem ?? new DocPathSystem()
    this.reader = props.reader
  }

  /**
   * Write content to file at the specified path (creates directory if needed)
   */
  async writeFile(
    relativePath: string,
    content: string,
  ): Promise<Error | null> {
    try {
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      const dirPath = this.pathSystem.dirname(fullPath)
      await fs.mkdir(dirPath, { recursive: true })
      await fs.writeFile(fullPath, content, "utf-8")
      return null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to write file at ${relativePath}`)
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
   * Create directory
   */
  async createDirectory(relativePath: string): Promise<Error | null> {
    try {
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      await fs.mkdir(fullPath, { recursive: true })
      return null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to create directory at ${relativePath}`)
    }
  }

  /**
   * Create directory if it doesn't exist
   */
  async ensureDirectoryExists(relativePath: string): Promise<Error | null> {
    try {
      if (this.reader) {
        const exists = await this.reader.exists(relativePath)
        if (exists) {
          return null
        }
      }

      const result = await this.createDirectory(relativePath)
      if (result instanceof Error) {
        return result
      }

      return null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to ensure directory exists at ${relativePath}`)
    }
  }

  /**
   * Copy file
   */
  async copyFile(
    sourcePath: string,
    destinationPath: string,
  ): Promise<Error | null> {
    try {
      const sourceFullPath = this.pathSystem.join(this.basePath, sourcePath)
      const destFullPath = this.pathSystem.join(this.basePath, destinationPath)
      await fs.copyFile(sourceFullPath, destFullPath)
      return null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(
            `Failed to copy file from ${sourcePath} to ${destinationPath}`,
          )
    }
  }

  /**
   * Move file
   */
  async moveFile(
    sourcePath: string,
    destinationPath: string,
  ): Promise<Error | null> {
    try {
      const sourceFullPath = this.pathSystem.join(this.basePath, sourcePath)
      const destFullPath = this.pathSystem.join(this.basePath, destinationPath)
      await fs.rename(sourceFullPath, destFullPath)
      return null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(
            `Failed to move file from ${sourcePath} to ${destinationPath}`,
          )
    }
  }
}
