import { DocFileSystem } from "./doc-file-system"
import { DocFileSystemOctokitRead } from "./doc-file-system-octokit-read"
import { DocFileSystemOctokitWrite } from "./doc-file-system-octokit-write"
import type { DocPathSystem } from "./doc-path-system"

type GitHubProps = {
  owner: string
  repo: string
  basePath: string
  branch?: string
  token: string
  pathSystem?: DocPathSystem
}

/**
 * GitHub repository file system using Octokit with separate read/write components
 */
export class DocFileSystemOctokit extends DocFileSystem {
  private readonly owner: string
  private readonly repo: string
  private readonly branch: string

  constructor(props: GitHubProps) {
    // Create Octokit read implementation
    const reader = new DocFileSystemOctokitRead({
      owner: props.owner,
      repo: props.repo,
      basePath: props.basePath,
      branch: props.branch,
      token: props.token,
      pathSystem: props.pathSystem,
    })

    // Create Octokit write implementation with reader
    const writer = new DocFileSystemOctokitWrite({
      owner: props.owner,
      repo: props.repo,
      basePath: props.basePath,
      branch: props.branch,
      token: props.token,
      pathSystem: props.pathSystem,
      reader,
    })

    // Call parent constructor with reader and writer
    super({
      basePath: props.basePath,
      pathSystem: props.pathSystem,
      reader,
      writer,
    })

    this.owner = props.owner
    this.repo = props.repo
    this.branch = props.branch ?? "main"
    Object.freeze(this)
  }

  /**
   * Get repository information
   */
  getRepositoryInfo(): { owner: string; repo: string; branch: string } {
    return {
      owner: this.owner,
      repo: this.repo,
      branch: this.branch,
    }
  }
}
