import type { z } from "zod"
import { zMilestone } from "./models/milestone"
import { zMilestoneFrontMatter } from "./models/milestone-front-matter"
import { OpenMarkdown } from "./open-markdown/open-markdown"

export async function parseMilestoneFile(
  fileName: string,
  fileContent: string,
): Promise<z.infer<typeof zMilestone>> {
  const content = fileContent.replace(/<!--.*?-->/gs, "").trim()

  const openMarkdown = new OpenMarkdown(content)

  if (openMarkdown.frontMatter.isEmpty()) {
    throw new Error("Front matter not found")
  }

  const data = zMilestoneFrontMatter.parse(openMarkdown.frontMatter.data)

  const id = fileName.replace(/\.md$/, "")

  return zMilestone.parse({
    id,
    title: data.title,
    description: data.description,
  } as const satisfies z.infer<typeof zMilestone>)
}
