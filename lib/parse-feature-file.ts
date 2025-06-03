import type { z } from "zod"
import { zFeature } from "./models/feature"
import { zFeatureFrontMatter } from "./models/feature-front-matter"
import { OpenMarkdown } from "./open-markdown/open-markdown"
import { toPriorityText } from "./to-priority-text"

export async function parseFeatureFile(fileName: string, fileContent: string) {
  const content = fileContent.replace(/<!--.*?-->/gs, "").trim()

  const openMarkdown = new OpenMarkdown(content)

  if (openMarkdown.frontMatter.isEmpty()) {
    throw new Error("Front matter not found")
  }

  const data = zFeatureFrontMatter.parse(openMarkdown.frontMatter.data)

  const slug = fileName.replace(/\.md$/, "")

  const name = openMarkdown.title

  const priority = toPriorityText(String(data.priority))

  return zFeature.parse({
    id: slug,
    name: name,
    primary: priority,
    milestone: data.milestone || "",
    isDone: Boolean(data["is-done"]),
  } as const satisfies z.infer<typeof zFeature>)
}
