import type { appFileFrontMatterSchema } from "@/lib/models"
import type { RelationInfo, SchemaDefinition } from "@/lib/types"
import type { z } from "zod"
import { CsvFileView } from "./csv-file-view"
import { DefaultFileViewer } from "./default-file-view"
import { JsonFileEditor } from "./json-file-editor"
import { MarkdownFileView } from "./markdown-file-view"

type Props = {
  fileData: {
    path: string
    frontMatter?: unknown
  }
  currentContent: string
  onChange: (content: string) => void
  onFrontMatterUpdate: (key: string, value: unknown) => void
  schema?: SchemaDefinition
  relations?: RelationInfo[]
}

/**
 * FileContentView
 */
export function FileContentView(props: Props) {
  if (props.fileData.path.endsWith(".md")) {
    return (
      <MarkdownFileView
        fileName={props.fileData.path}
        content={props.currentContent}
        onChange={props.onChange}
        frontMatter={
          props.fileData.frontMatter as z.infer<typeof appFileFrontMatterSchema>
        }
        onFrontMatterUpdate={props.onFrontMatterUpdate}
        schema={props.schema}
        relations={props.relations}
      />
    )
  }

  if (props.fileData.path.endsWith(".csv")) {
    return (
      <CsvFileView
        fileName={props.fileData.path}
        content={props.currentContent}
        onChange={props.onChange}
      />
    )
  }

  if (props.fileData.path.endsWith(".json")) {
    return <JsonFileEditor content={props.currentContent} />
  }

  return <DefaultFileViewer content={props.currentContent} />
}
