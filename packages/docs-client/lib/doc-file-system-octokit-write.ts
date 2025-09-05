import { Octokit } from "@octokit/rest"
import type { DocFileSystemOctokitRead } from "./doc-file-system-octokit-read"
import { DocPathSystem } from "./doc-path-system"
import type { DocFileSystemReadType, DocFileSystemWriteType } from "./types"

type Props = {
  owner: string
  repo: string
  basePath: string
  branch?: string
  token: string
  pathSystem?: DocPathSystem
  reader?: DocFileSystemReadType
}

/**
 * GitHub repository write-only file system using Octokit
 */
export class DocFileSystemOctokitWrite implements DocFileSystemWriteType {
  private readonly octokit: Octokit
  private readonly owner: string
  private readonly repo: string
  private readonly basePath: string
  private readonly branch: string
  private readonly pathSystem: DocPathSystem
  private readonly reader?: DocFileSystemReadType

  constructor(props: Props) {
    this.owner = props.owner
    this.repo = props.repo
    this.basePath = props.basePath
    this.branch = props.branch ?? "main"
    this.pathSystem = props.pathSystem ?? new DocPathSystem()
    this.octokit = new Octokit({ auth: props.token })
    this.reader = props.reader
    Object.freeze(this)
  }

  /**
   * Write content to file in GitHub repository
   */
  async writeFile(
    relativePath: string,
    content: string,
  ): Promise<Error | null> {
    try {
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      const encodedContent = Buffer.from(content).toString("base64")
      let sha: string | undefined

      // Try to get SHA from reader cache if it's an OctokitRead instance
      if (this.reader && "getCachedSha" in this.reader) {
        sha = (this.reader as DocFileSystemOctokitRead).getCachedSha(
          relativePath,
        )
      }

      // If not cached, try to get existing file SHA
      if (!sha) {
        try {
          const existing = await this.octokit.repos.getContent({
            owner: this.owner,
            repo: this.repo,
            path: fullPath,
            ref: this.branch,
          })
          if ("sha" in existing.data) {
            sha = existing.data.sha
          }
        } catch {
          // File doesn't exist, will create new
        }
      }

      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: fullPath,
        message: `Update ${fullPath}`,
        content: encodedContent,
        branch: this.branch,
        sha,
      })

      return null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to write file at ${relativePath}`)
    }
  }

  /**
   * Delete file from GitHub repository
   */
  async deleteFile(relativePath: string): Promise<Error | null> {
    try {
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      let sha: string | undefined

      // Try to get SHA from reader cache if it's an OctokitRead instance
      if (this.reader && "getCachedSha" in this.reader) {
        sha = (this.reader as DocFileSystemOctokitRead).getCachedSha(
          relativePath,
        )
      }

      // If not cached, get from API
      if (!sha) {
        const existing = await this.octokit.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path: fullPath,
          ref: this.branch,
        })
        if ("sha" in existing.data) {
          sha = existing.data.sha
        }
      }

      if (!sha) {
        return new Error(`Cannot delete file at ${relativePath}: SHA not found`)
      }

      await this.octokit.repos.deleteFile({
        owner: this.owner,
        repo: this.repo,
        path: fullPath,
        message: `Delete ${fullPath}`,
        sha,
        branch: this.branch,
      })

      return null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to delete file at ${relativePath}`)
    }
  }

  /**
   * Create directory by creating a .gitkeep file
   */
  async createDirectory(relativePath: string): Promise<Error | null> {
    try {
      const gitkeepPath = this.pathSystem.join(relativePath, ".gitkeep")
      return await this.writeFile(gitkeepPath, "")
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

      return await this.createDirectory(relativePath)
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to ensure directory exists at ${relativePath}`)
    }
  }

  /**
   * Copy file to new location
   */
  async copyFile(
    sourcePath: string,
    destinationPath: string,
  ): Promise<Error | null> {
    try {
      if (!this.reader) {
        return new Error("Reader is required for copy operation")
      }

      const content = await this.reader.readFile(sourcePath)
      if (content instanceof Error) {
        return content
      }
      if (content === null) {
        return new Error(`Source file ${sourcePath} does not exist`)
      }

      return await this.writeFile(destinationPath, content)
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(
            `Failed to copy file from ${sourcePath} to ${destinationPath}`,
          )
    }
  }

  /**
   * Move file to new location
   */
  async moveFile(
    sourcePath: string,
    destinationPath: string,
  ): Promise<Error | null> {
    try {
      const copyResult = await this.copyFile(sourcePath, destinationPath)
      if (copyResult !== null) {
        return copyResult
      }

      return await this.deleteFile(sourcePath)
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(
            `Failed to move file from ${sourcePath} to ${destinationPath}`,
          )
    }
  }
}
