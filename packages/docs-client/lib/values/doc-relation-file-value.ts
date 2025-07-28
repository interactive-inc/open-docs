import { zDocRelationFile } from "@/models"
import type { DocRelationFile } from "@/types"

/**
 * Relation file
 */
export class DocRelationFileValue {
  constructor(private readonly value: DocRelationFile) {
    zDocRelationFile.parse(value)
    Object.freeze(this)
    Object.freeze(this.value)
  }

  /**
   * File path
   */
  get id() {
    return this.value.name
  }

  /**
   * Slug
   */
  get slug() {
    return this.value.name
  }

  /**
   * Display label
   */
  get label() {
    return this.value.label || this.value.name
  }

  /**
   * Create from file path and title
   */
  static from(filePath: string, title: string | null): DocRelationFileValue {
    const fileName = DocRelationFileValue.extractFileName(filePath)
    return new DocRelationFileValue({
      name: fileName,
      label: title || fileName,
      value: null,
      path: null,
    } satisfies DocRelationFile)
  }

  /**
   * Extract file name from file path (without extension)
   */
  private static extractFileName(filePath: string): string {
    return filePath.split("/").pop()?.replace(".md", "") || filePath
  }

  /**
   * Convert to JSON format
   */
  toJson(): DocRelationFile {
    return { ...this.value }
  }
}
