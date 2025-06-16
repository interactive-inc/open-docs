import { EditableFrontMatterView } from "@/app/_components/file-view/editable-front-matter-view"
import { FileHeader } from "@/app/_components/file-view/file-header"
import { Card } from "@/app/_components/ui/card"
import type { appFileFrontMatterSchema } from "@/lib/models"
import type { RelationGroup, SchemaDefinition } from "@/lib/types"
import { marked } from "marked"
import type { ReactNode } from "react"
import type { z } from "zod"

import "github-markdown-css"

type Props = {
  filePath: string
  fileData: {
    path: string
    title: string | null
  }
  cwd: string
  content: string
  onChange(content: string): void
  frontMatter: z.infer<typeof appFileFrontMatterSchema>
  onFrontMatterUpdate: (key: string, value: unknown) => void
  onReload: () => void
  isLoading: boolean
  schema?: SchemaDefinition
  relations?: RelationGroup[]
}

export function MarkdownFileView(props: Props): ReactNode {
  const frontMatter = props.frontMatter

  const hasFrontMatter =
    frontMatter !== null && Object.keys(frontMatter || {}).length > 0

  const html = marked.parse(props.content)

  return (
    <div className="h-full space-y-2">
      <FileHeader
        filePath={props.filePath}
        fileData={props.fileData}
        cwd={props.cwd}
        onReload={props.onReload}
        isLoading={props.isLoading}
      />
      {hasFrontMatter && (
        <EditableFrontMatterView
          frontMatter={frontMatter as z.infer<typeof appFileFrontMatterSchema>}
          onUpdate={props.onFrontMatterUpdate}
          schema={props.schema}
          relations={props.relations}
        />
      )}
      <Card className="overflow-hidden rounded-md p-0">
        <div
          className="markdown-body p-4"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Card>
    </div>
  )
}
