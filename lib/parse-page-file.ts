import type { z } from "zod"
import { extractHeading } from "./markdown/extract-heading"
import { parseMarkdown } from "./markdown/parse-markdown"
import { zPage } from "./models/page"
import { zPageFrontMatter } from "./models/page-front-matter"
import { parsePagePath } from "./parse-page-path"

export async function parsePageFile(fileName: string, fileContent: string) {
  const content = fileContent.replace(/<!--.*?-->/gs, "").trim()

  const markdown = parseMarkdown(content)

  if (markdown.frontMatter === null) {
    throw new Error("Front matter not found")
  }

  const data = zPageFrontMatter.parse(markdown.frontMatter)

  const slug = fileName.replace(/\.md$/, "")

  const pathNodes = parsePagePath(slug)

  const pagePath = `/${pathNodes.join("/")}`

  const name = extractHeading(content)

  return zPage.parse({
    id: slug,
    name: name,
    path: pagePath,
    features: data.features || [],
  } as const satisfies z.infer<typeof zPage>)
}
