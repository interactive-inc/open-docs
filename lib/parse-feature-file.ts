import type { z } from "zod"
import { extractHeading } from "./front-matter/extract-heading"
import { parseFrontMatter } from "./front-matter/parse-front-matter"
import { vFeature } from "./models/feature"
import { vFeatureFrontMatter } from "./models/feature-front-matter"
import { toPriorityText } from "./to-priority-text"

export async function parseFeatureFile(fileName: string, fileContent: string) {
  const content = fileContent.replace(/<!--.*?-->/gs, "").trim()

  const parsedData = parseFrontMatter<
    z.infer<typeof vFeatureFrontMatter>,
    typeof vFeatureFrontMatter
  >({
    text: content,
    schema: vFeatureFrontMatter,
  })

  const slug = fileName.replace(/\.md$/, "")

  const name = extractHeading(content)

  const priority = toPriorityText(parsedData.data.priority)

  return vFeature.parse({
    id: slug,
    name: name,
    primary: priority,
    milestone: parsedData.data.milestone || "",
    isDone: parsedData.data["is-done"] === "true",
  } as const satisfies z.infer<typeof vFeature>)
}
