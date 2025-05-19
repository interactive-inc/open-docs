import type { z } from "zod"
import { parseMarkdown } from "./markdown/parse-markdown"
import { vMilestone } from "./models/milestone"
import { vMilestoneFrontMatter } from "./models/milestone-front-matter"

export async function parseMilestoneFile(
  fileName: string,
  fileContent: string,
): Promise<z.infer<typeof vMilestone>> {
  const content = fileContent.replace(/<!--.*?-->/gs, "").trim()

  const markdown = parseMarkdown(content)

  if (markdown.frontMatter === null) {
    throw new Error("Front matter not found")
  }

  const data = vMilestoneFrontMatter.parse(markdown.frontMatter)

  const id = fileName.replace(/\.md$/, "")

  return vMilestone.parse({
    id,
    title: data.title,
    description: data.description,
  } as const satisfies z.infer<typeof vMilestone>)
}
