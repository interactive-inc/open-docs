import { FrontMatterView } from "@/app/_components/file-view/front-matter-view"
import { PageHeader } from "@/app/_components/page-header"
import { parseMarkdown } from "@/lib/markdown/parse-markdown"
import { marked } from "marked"
import type { ReactNode } from "react"

import "zenn-content-css"

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
    <div className="space-y-4 p-4">
      <div className="flex gap-2">
        <PageHeader filePath={props.fileName} />
      </div>
      {hasFrontMatter && <FrontMatterView frontMatter={frontMatter} />}
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
      <div className="znc" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
