import {
  zDocFile,
  zDocFileIndex,
  zDocFileIndexFrontMatter,
  zDocFileMd,
  zDocFileMdFrontMatter,
  zDocFileUnknown,
  zDocRelation,
  zDocRelationField,
  zDocRelationFile,
  zDocSchema,
  zDocSchemaField,
  zDocSchemaFieldBoolean,
  zDocSchemaFieldMultiBoolean,
  zDocSchemaFieldMultiNumber,
  zDocSchemaFieldMultiRelation,
  zDocSchemaFieldMultiSelectNumber,
  zDocSchemaFieldMultiSelectText,
  zDocSchemaFieldMultiText,
  zDocSchemaFieldNumber,
  zDocSchemaFieldRelation,
  zDocSchemaFieldSelectNumber,
  zDocSchemaFieldSelectText,
  zDocSchemaFieldText,
  zDocSchemaFieldType,
  zDocTreeDirectoryNode,
  zDocTreeFileNode,
  zDocTreeNode,
} from "@interactive-inc/docs/models"
import { z } from "zod/v4"

// 再エクスポート
export {
  zDocFile,
  zDocFileIndex,
  zDocFileIndexFrontMatter,
  zDocFileMd,
  zDocFileMdFrontMatter,
  zDocFileUnknown,
  zDocRelation,
  zDocRelationField,
  zDocRelationFile,
  zDocSchema,
  zDocSchemaField,
  zDocSchemaFieldBoolean,
  zDocSchemaFieldMultiBoolean,
  zDocSchemaFieldMultiNumber,
  zDocSchemaFieldMultiRelation,
  zDocSchemaFieldMultiSelectNumber,
  zDocSchemaFieldMultiSelectText,
  zDocSchemaFieldMultiText,
  zDocSchemaFieldNumber,
  zDocSchemaFieldRelation,
  zDocSchemaFieldSelectNumber,
  zDocSchemaFieldSelectText,
  zDocSchemaFieldText,
  zDocSchemaFieldType,
  zDocTreeFileNode,
  zDocTreeDirectoryNode,
  zDocTreeNode,
}

// serverパッケージ固有の定義
export const zDirectoryJson = z.object({
  cwd: z.string(),
  indexFile: zDocFileIndex,
  files: z.array(zDocFile),
  relations: z.array(zDocRelation),
})

// 後方互換性のためのエイリアス
export const zDocDirectory = zDirectoryJson
export const zDocFileNode = zDocTreeNode
