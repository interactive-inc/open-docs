import type { z } from "zod"
import { extractHeading } from "./markdown/extract-heading"
import { parseMarkdown } from "./markdown/parse-markdown"
import { zFeature } from "./models/feature"
import { zFeatureFrontMatter } from "./models/feature-front-matter"
import { toPriorityText } from "./to-priority-text"

export async function parseFeatureFile(fileName: string, fileContent: string) {
  const content = fileContent.replace(/<!--.*?-->/gs, "").trim()

  const markdown = parseMarkdown(content)

  if (markdown.frontMatter === null) {
    throw new Error("Front matter not found")
  }

  const data = zFeatureFrontMatter.parse(markdown.frontMatter)

  const slug = fileName.replace(/\.md$/, "")

  const name = extractHeading(content)

  const priority = toPriorityText(data.priority)

  return zFeature.parse({
    id: slug,
    name: name,
    primary: priority,
    milestone: data.milestone || "",
    isDone: data["is-done"] === "true",
  } as const satisfies z.infer<typeof zFeature>)
}
