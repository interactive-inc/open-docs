import type { z } from "zod"
import { parseFrontMatter } from "./front-matter/parse-front-matter"
import { vMilestone } from "./models/milestone"
import { vMilestoneFrontMatter } from "./models/milestone-front-matter"

export async function parseMilestoneFile(
  fileName: string,
  fileContent: string,
): Promise<z.infer<typeof vMilestone>> {
  const content = fileContent.replace(/<!--.*?-->/gs, "").trim()

  const parsedData = parseFrontMatter<
    z.infer<typeof vMilestoneFrontMatter>,
    typeof vMilestoneFrontMatter
  >({
    text: content,
    schema: vMilestoneFrontMatter,
  })

  const id = fileName.replace(/\.md$/, "")

  return vMilestone.parse({
    id,
    title: parsedData.data.title,
    description: parsedData.data.description,
  } as const satisfies z.infer<typeof vMilestone>)
}
