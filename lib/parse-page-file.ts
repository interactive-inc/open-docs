import type { z } from "zod"
import { zPage } from "./models/page"
import { zPageFrontMatter } from "./models/page-front-matter"
import { OpenMarkdown } from "./open-markdown/open-markdown"
import { parsePagePath } from "./parse-page-path"

export async function parsePageFile(fileName: string, fileContent: string) {
  const content = fileContent.replace(/<!--.*?-->/gs, "").trim()

  const openMarkdown = new OpenMarkdown(content)

  if (openMarkdown.frontMatter.isEmpty()) {
    throw new Error("Front matter not found")
  }

  const data = zPageFrontMatter.parse(openMarkdown.frontMatter.data)

  const slug = fileName.replace(/\.md$/, "")

  const pathNodes = parsePagePath(slug)

  const pagePath = `/${pathNodes.join("/")}`

  const name = openMarkdown.title

  return zPage.parse({
    id: slug,
    name: name,
    path: pagePath,
    features: data.features || [],
  } as const satisfies z.infer<typeof zPage>)
}
