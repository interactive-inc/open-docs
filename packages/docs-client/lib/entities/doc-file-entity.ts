import type { DocFileIndexEntity } from "./doc-file-index-entity"
import type { DocFileMdEntity } from "./doc-file-md-entity"
import type { DocFileUnknownEntity } from "./doc-file-unknown-entity"

export type DocFileEntity =
  | DocFileMdEntity
  | DocFileIndexEntity
  | DocFileUnknownEntity
