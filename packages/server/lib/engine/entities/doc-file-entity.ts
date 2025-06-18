import type { DocFileIndexEntity } from "@/lib/engine/entities/doc-file-index-entity"
import type { DocFileMdEntity } from "@/lib/engine/entities/doc-file-md-entity"

export type DocFileEntity = DocFileMdEntity | DocFileIndexEntity
