import { FrontMatterView } from "@/app/_components/file-view/front-matter-view"
import { PageHeader } from "@/app/_components/page-header"
import { Card } from "@/app/_components/ui/card"
import { parseMarkdown } from "@/lib/markdown/parse-markdown"
import { marked } from "marked"
import type { ReactNode } from "react"

import "github-markdown-css"

type Props = {
  fileName: string
  content: string
  onChange(content: string): void
}

export function MarkdownFileView(props: Props): ReactNode {
  const markdown = parseMarkdown(props.content)

  const frontMatter = markdown.frontMatter

  const hasFrontMatter =
    frontMatter !== null && Object.keys(frontMatter || {}).length > 0

  const html = marked.parse(markdown.content)

  return (
    <div className="h-full space-y-2 p-4">
      <div className="flex gap-2">
        <PageHeader filePath={props.fileName} />
      </div>
      {hasFrontMatter && <FrontMatterView frontMatter={frontMatter} />}
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
