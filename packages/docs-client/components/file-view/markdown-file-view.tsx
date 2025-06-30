import { marked } from "marked"
import type { ReactNode } from "react"
import { ArchiveRestoreBanner } from "@/components/file-view/archive-restore-banner"
import { EditableFrontMatterView } from "@/components/file-view/editable-front-matter-view"
import { FileHeader } from "@/components/file-view/file-header"
import { Card } from "@/components/ui/card"
import type { DocRelation, DocSchemaRecord, DocFileMdFrontMatter } from "@/lib/types"

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
  frontMatter: DocFileMdFrontMatter
  onFrontMatterUpdate: (key: string, value: unknown) => void
  onReload: () => void
  isLoading: boolean
  schema?: DocSchemaRecord
  relations?: DocRelation[]
}

export function MarkdownFileView(props: Props): ReactNode {
  const frontMatter = props.frontMatter

  const hasFrontMatter =
    frontMatter !== null && Object.keys(frontMatter || {}).length > 0

  const html = marked.parse(props.content)

  // アーカイブファイルかどうかを判定
  const isArchived = props.filePath.includes("/_/")

  return (
    <div className="h-full space-y-2">
      {isArchived && (
        <ArchiveRestoreBanner
          filePath={props.filePath}
          onRestore={props.onReload}
        />
      )}
      <FileHeader
        filePath={props.filePath}
        fileData={props.fileData}
        cwd={props.cwd}
        onReload={props.onReload}
        isLoading={props.isLoading}
      />
      {hasFrontMatter && (
        <EditableFrontMatterView
          frontMatter={frontMatter}
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
