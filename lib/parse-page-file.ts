import type { z } from "zod"
import { extractHeading } from "./front-matter/extract-heading"
import { parseFrontMatter } from "./front-matter/parse-front-matter"
import { vPage } from "./models/page"
import { vPageFrontMatter } from "./models/page-front-matter"
import { parsePagePath } from "./parse-page-path"

export async function parsePageFile(fileName: string, fileContent: string) {
  const content = fileContent.replace(/<!--.*?-->/gs, "").trim()

  const parsedData = parseFrontMatter<
    z.infer<typeof vPageFrontMatter>,
    typeof vPageFrontMatter
  >({
    text: content,
    schema: vPageFrontMatter,
  })

  const slug = fileName.replace(/\.md$/, "")

  const pathNodes = parsePagePath(slug)

  const pagePath = `/${pathNodes.join("/")}`

  const name = extractHeading(content)

  return vPage.parse({
    id: slug,
    name: name,
    path: pagePath,
    features: parsedData.data.features || [],
  } as const satisfies z.infer<typeof vPage>)
}
