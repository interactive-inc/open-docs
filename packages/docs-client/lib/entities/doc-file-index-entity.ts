import { zDocFileIndex } from "@/models"
import type {
  DocClientConfig,
  DocCustomSchema,
  DocFileIndex,
  DocFileIndexAny,
  DocFilePath,
} from "@/types"
import { DocFileIndexContentValue } from "../values/doc-file-index-content-value"

/**
 * Document directory entity
 */
export class DocFileIndexEntity<T extends DocCustomSchema> {
  constructor(
    readonly value: DocFileIndex<T>,
    private readonly customSchema: T,
    private readonly config: DocClientConfig = {
      defaultIndexIcon: "📁",
      indexFileName: "index.md",
      archiveDirectoryName: "_",
      defaultDirectoryName: "Directory",
      indexMetaIncludes: [],
      directoryExcludes: [".vitepress"],
    },
  ) {
    zDocFileIndex.parse(value)
    Object.freeze(this)
  }

  /**
   * Content
   */
  get content(): DocFileIndexContentValue<T> {
    return new DocFileIndexContentValue<T>(
      this.value.content,
      this.customSchema,
      this.config,
    )
  }

  /**
   * Path information
   */
  get path(): DocFilePath {
    return this.value.path
  }

  /**
   * Update content
   */
  withContent(content: DocFileIndexContentValue<T>): DocFileIndexEntity<T> {
    return new DocFileIndexEntity<T>(
      { ...this.value, content: content.value },
      this.customSchema,
    )
  }

  /**
   * Update path
   */
  withPath(path: DocFilePath): DocFileIndexEntity<T> {
    return new DocFileIndexEntity<T>(
      { ...this.value, path: path },
      this.customSchema,
    )
  }

  /**
   * z.infer<typeof zDocFileIndex>
   */
  toJson(): DocFileIndexAny {
    return this.value
  }
}
