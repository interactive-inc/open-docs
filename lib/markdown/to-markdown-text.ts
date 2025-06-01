import { parseMarkdown } from "./parse-markdown"
import { toFrontMatterText } from "./to-front-matter-text"

type Props = {
  frontMatter: Record<string, unknown>
  content: string
}

export function toMarkdownText(props: Props): string {
  const markdown = parseMarkdown(props.content)

  const existingContent = markdown.content.trim()

  const frontMatterText = toFrontMatterText(props.frontMatter)

  return `---\n${frontMatterText}\n---\n\n${existingContent}`.trim()
}
