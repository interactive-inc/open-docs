import type { DocFileReadSystem } from "./doc-file-read-system"
import type { DocFileSystem } from "./doc-file-system"
import type { DocFileIndexEntity } from "./entities/doc-file-index-entity"
import { DocRelationValue } from "./values/doc-relation-value"

type Props = {
  reader: DocFileReadSystem
  fileSystem: DocFileSystem
}

/**
 * ファイルリレーション処理を担当するシステム
 */
export class DocFileRelationSystem {
  private readonly reader: DocFileReadSystem
  private readonly fileSystem: DocFileSystem

  constructor(props: Props) {
    this.reader = props.reader
    this.fileSystem = props.fileSystem
  }

  /**
   * インデックスファイルからリレーション情報を取得
   */
  async getRelationsFromIndexFile(
    indexFile: DocFileIndexEntity,
  ): Promise<DocRelationValue[]> {
    const relationFields = indexFile.getRelationFields()

    const relations: DocRelationValue[] = []

    for (const relationField of relationFields) {
      const exits = await this.reader.exists(relationField.relationPath)

      if (!exits) {
        relations.push(DocRelationValue.empty(relationField.relationPath))
        continue
      }

      const relationFiles = await this.reader.readDirectoryFiles(
        relationField.relationPath,
      )

      const files: Array<{ value: string; label: string; path: string }> = []

      for (const filePath of relationFiles) {
        const exists = await this.fileSystem.exists(filePath)

        const fileName =
          filePath.split("/").pop()?.replace(".md", "") || filePath

        if (!exists) {
          files.push({
            value: fileName,
            label: fileName,
            path: filePath,
          })
          continue
        }

        const docFile = await this.reader.readFile(filePath)

        files.push({
          value: fileName,
          label: docFile.title || fileName,
          path: filePath,
        })
      }

      relations.push(
        DocRelationValue.fromData({
          path: relationField.relationPath,
          files,
        }),
      )
    }

    return relations
  }
}
