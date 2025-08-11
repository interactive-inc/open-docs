import type { DocFileIndexReference } from "@/doc-file-index-reference"
import type { DocFileMdReference } from "@/doc-file-md-reference"
import type { DocFileUnknownReference } from "@/doc-file-unknown-reference"
import type { DocCustomSchema } from "@/types"

export type DocFileReference<T extends DocCustomSchema> =
  | DocFileIndexReference<T>
  | DocFileMdReference<T>
  | DocFileUnknownReference<T>

export type DocFileDirectoryReference<T extends DocCustomSchema> =
  | DocFileMdReference<T>
  | DocFileUnknownReference<T>
