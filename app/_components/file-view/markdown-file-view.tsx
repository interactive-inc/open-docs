import { EditableFrontMatterView } from "@/app/_components/file-view/editable-front-matter-view"
import { Card } from "@/app/_components/ui/card"
import type { AppFileFrontMatter } from "@/system/models/app-file-front-matter"
import { marked } from "marked"
import type { ReactNode } from "react"

import "github-markdown-css"

type Props = {
  fileName: string
  content: string
  onChange(content: string): void
  frontMatter: AppFileFrontMatter
  onFrontMatterUpdate: (key: string, value: unknown) => void
  schema?: Record<
    string,
    {
      type: string
      relationPath?: string
    }
  >
  relations?: Array<{
    path: string
    files: Array<{
      value: string
      label: string
      path: string
    }>
  }>
}

export function MarkdownFileView(props: Props): ReactNode {
  const frontMatter = props.frontMatter

  const hasFrontMatter =
    frontMatter !== null && Object.keys(frontMatter || {}).length > 0

  const html = marked.parse(props.content)

  return (
    <div className="h-full space-y-2">
      {hasFrontMatter && (
        <EditableFrontMatterView
          frontMatter={frontMatter as AppFileFrontMatter}
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
