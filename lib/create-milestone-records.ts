import fs from "node:fs/promises"
import path from "node:path"
import type { z } from "zod"
import type { zMilestone } from "./models/milestone"
import { parseMilestoneFile } from "./parse-milestone-file"
import { readMarkdownFiles } from "./read-markdown-files"

type Props = {
  directory: string
}

export async function createMilestoneRecords(props: Props) {
  const milestonesPath = path.resolve(props.directory)

  const mdFiles = await readMarkdownFiles(milestonesPath)

  const promises: Promise<z.infer<typeof zMilestone>>[] = []

  for (const file of mdFiles) {
    const filePath = path.join(milestonesPath, file)
    const fileContent = await fs.readFile(filePath, "utf-8")
    const milestonePromise = parseMilestoneFile(file, fileContent)
    promises.push(milestonePromise)
  }

  return await Promise.all(promises)
}
