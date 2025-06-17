import { ArchiveRestoreBanner } from "@/app/_components/file-view/archive-restore-banner"
import { EditableFrontMatterView } from "@/app/_components/file-view/editable-front-matter-view"
import { FileHeader } from "@/app/_components/file-view/file-header"
import { Card } from "@/app/_components/ui/card"
import type { zDocFileMdFrontMatter } from "@/lib/models"
import type { DocRelation, DocSchemaRecord } from "@/lib/types"
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
  frontMatter: z.infer<typeof zDocFileMdFrontMatter>
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
          frontMatter={frontMatter as z.infer<typeof zDocFileMdFrontMatter>}
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
