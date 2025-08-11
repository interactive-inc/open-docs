import type { z } from "zod"
import { zDocFileMd } from "@/models"
import type { DocCustomSchema, DocFileMd, DocFilePath } from "@/types"
import type { DocFileMdMetaValue } from "@/values/doc-file-md-meta-value"
import { DocFileMdContentValue } from "../values/doc-file-md-content-value"

/**
 * Markdown file entity
 */
export class DocFileMdEntity<T extends DocCustomSchema> {
  constructor(
    readonly value: DocFileMd<T>,
    private readonly customSchema: T,
  ) {
    zDocFileMd.parse(value)
    Object.freeze(this)
  }

  /**
   * Content
   */
  get content(): DocFileMdContentValue<T> {
    return new DocFileMdContentValue<T>(this.value.content, this.customSchema)
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
  withContent(content: DocFileMdContentValue<T>): DocFileMdEntity<T> {
    return new DocFileMdEntity<T>(
      { ...this.value, content: content.value },
      this.customSchema,
    )
  }

  /**
   * Update path
   */
  withPath(path: DocFilePath): DocFileMdEntity<T> {
    return new DocFileMdEntity<T>(
      { ...this.value, path: path },
      this.customSchema,
    )
  }

  withMeta(meta: DocFileMdMetaValue<T>): DocFileMdEntity<T> {
    const draft = this.content.withMeta(meta)
    return new DocFileMdEntity<T>(
      {
        ...this.value,
        content: draft.value,
      },
      this.customSchema,
    )
  }

  withTitle(title: string): DocFileMdEntity<T> {
    const draft = this.content.withTitle(title)
    return new DocFileMdEntity<T>(
      {
        ...this.value,
        content: draft.value,
      },
      this.customSchema,
    )
  }

  withDescription(
    description: string,
    defaultTitle?: string,
  ): DocFileMdEntity<T> {
    const draft = this.content.withDescription(description, defaultTitle)
    return new DocFileMdEntity<T>(
      {
        ...this.value,
        content: draft.value,
      },
      this.customSchema,
    )
  }

  /**
   * z.infer<typeof zDocFileMd>
   */
  toJson(): z.infer<typeof zDocFileMd> {
    return zDocFileMd.parse(this.value)
  }
}
