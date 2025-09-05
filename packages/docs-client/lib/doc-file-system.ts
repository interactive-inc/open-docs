import { DocFileSystemRead } from "./doc-file-system-read"
import { DocFileSystemWrite } from "./doc-file-system-write"
import { DocPathSystem } from "./doc-path-system"
import type { DocFileSystemReadType, DocFileSystemWriteType } from "./types"

type Props = {
  basePath: string
  pathSystem?: DocPathSystem
  reader?: DocFileSystemReadType
  writer?: DocFileSystemWriteType
}

/**
 * File system wrapper with optional dependency injection for read/write operations
 */
export class DocFileSystem {
  protected readonly reader: DocFileSystemReadType
  protected readonly writer: DocFileSystemWriteType
  protected readonly basePath: string
  protected readonly pathSystem: DocPathSystem

  constructor(props: Props) {
    this.basePath = props.basePath
    this.pathSystem = props.pathSystem ?? new DocPathSystem()

    // Use injected reader or create default
    this.reader =
      props.reader ??
      new DocFileSystemRead({
        basePath: this.basePath,
        pathSystem: this.pathSystem,
      })

    // Use injected writer or create default
    this.writer =
      props.writer ??
      new DocFileSystemWrite({
        basePath: this.basePath,
        pathSystem: this.pathSystem,
        reader: this.reader,
      })
  }

  /**
   * Read file content at the specified path
   */
  async readFile(relativePath: string): Promise<string | null | Error> {
    return this.reader.readFile(relativePath)
  }

  /**
   * Write content to file at the specified path (creates directory if needed)
   */
  async writeFile(
    relativePath: string,
    content: string,
  ): Promise<Error | null> {
    return this.writer.writeFile(relativePath, content)
  }

  /**
   * Delete file at the specified path
   */
  async deleteFile(relativePath: string): Promise<Error | null> {
    return this.writer.deleteFile(relativePath)
  }

  /**
   * Get file name from path
   */
  readFileName(relativePath: string): string {
    return this.reader.readFileName(relativePath)
  }

  /**
   * Get file extension from path
   */
  readFileExtension(relativePath: string): string {
    return this.reader.readFileExtension(relativePath)
  }

  /**
   * Get directory path where the file exists
   */
  readFileDirectory(relativePath: string): string {
    return this.reader.readFileDirectory(relativePath)
  }

  /**
   * Get list of entries in directory
   */
  async readDirectoryFileNames(relativePath = ""): Promise<string[] | Error> {
    return this.reader.readDirectoryFileNames(relativePath)
  }

  async readDirectoryFilePaths(
    relativePath: string,
  ): Promise<string[] | Error> {
    return this.reader.readDirectoryFilePaths(relativePath)
  }

  /**
   * Check if path is a directory
   */
  async isDirectory(relativePath: string): Promise<boolean> {
    return this.reader.isDirectory(relativePath)
  }

  /**
   * Check if path is a file
   */
  async isFile(relativePath: string): Promise<boolean> {
    return this.reader.isFile(relativePath)
  }

  /**
   * Check if file or directory exists
   */
  async exists(relativePath: string): Promise<boolean> {
    return this.reader.exists(relativePath)
  }

  /**
   * Check if directory exists
   */
  async directoryExists(relativePath: string): Promise<boolean> {
    return this.reader.directoryExists(relativePath)
  }

  /**
   * Check if file exists
   */
  async fileExists(relativePath: string): Promise<boolean> {
    return this.reader.fileExists(relativePath)
  }

  /**
   * Get base path
   */
  getBasePath(): string {
    return this.reader.getBasePath()
  }

  /**
   * Convert relative path to absolute path
   */
  resolve(relativePath: string): string {
    return this.reader.resolve(relativePath)
  }

  /**
   * Create directory
   */
  async createDirectory(relativePath: string): Promise<Error | null> {
    return this.writer.createDirectory(relativePath)
  }

  /**
   * Get file size in bytes
   */
  async getFileSize(relativePath: string): Promise<number | Error> {
    return this.reader.getFileSize(relativePath)
  }

  /**
   * Create directory if it doesn't exist
   */
  async ensureDirectoryExists(relativePath: string): Promise<Error | null> {
    return this.writer.ensureDirectoryExists(relativePath)
  }

  /**
   * Copy file
   */
  async copyFile(
    sourcePath: string,
    destinationPath: string,
  ): Promise<Error | null> {
    return this.writer.copyFile(sourcePath, destinationPath)
  }

  /**
   * Move file
   */
  async moveFile(
    sourcePath: string,
    destinationPath: string,
  ): Promise<Error | null> {
    return this.writer.moveFile(sourcePath, destinationPath)
  }

  /**
   * Get file last modified time
   */
  async getFileModifiedTime(relativePath: string): Promise<Date | Error> {
    return this.reader.getFileModifiedTime(relativePath)
  }

  /**
   * Get file creation time
   */
  async getFileCreatedTime(relativePath: string): Promise<Date | Error> {
    return this.reader.getFileCreatedTime(relativePath)
  }
}
