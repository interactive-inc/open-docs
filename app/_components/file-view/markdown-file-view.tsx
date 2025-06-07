import { EditableFrontMatterView } from "@/app/_components/file-view/editable-front-matter-view"
import { Card } from "@/app/_components/ui/card"
import type { AppFileFrontMatter } from "@/lib/docs-engine/models"
import { OpenMarkdown } from "@/lib/open-markdown/open-markdown"
import { marked } from "marked"
import type { ReactNode } from "react"

import "github-markdown-css"

type Props = {
  fileName: string
  content: string
  onChange(content: string): void
  frontMatter: AppFileFrontMatter
  onFrontMatterUpdate: (key: string, value: unknown) => void
}

export function MarkdownFileView(props: Props): ReactNode {
  const openMarkdown = new OpenMarkdown(props.content)
  const markdown = {
    frontMatter: openMarkdown.frontMatter.data,
    content: openMarkdown.content,
  }

  // APIから取得したfront matterを優先して使用
  const frontMatter = props.frontMatter || markdown.frontMatter

  const hasFrontMatter =
    frontMatter !== null && Object.keys(frontMatter || {}).length > 0

  const html = marked.parse(markdown.content)

  return (
    <div className="h-full space-y-2">
      {hasFrontMatter && (
        <EditableFrontMatterView
          frontMatter={frontMatter as AppFileFrontMatter}
          onUpdate={props.onFrontMatterUpdate}
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
