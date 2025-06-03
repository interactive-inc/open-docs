import fs from "node:fs/promises"
import path from "node:path"
import type { z } from "zod"
import type { zFeature } from "./models/feature"
import { parseFeatureFile } from "./parse-feature-file"
import { readMarkdownFiles } from "./read-markdown-files"

type Props = {
  directory: string
}

export async function createFeatureRecords(props: Props) {
  const featuresPath = path.resolve(props.directory)

  const mdFiles = await readMarkdownFiles(featuresPath)

  const promises: Promise<z.infer<typeof zFeature>>[] = []

  for (const file of mdFiles) {
    if (file === "index.md") continue
    const filePath = path.join(featuresPath, file)
    const fileContent = await fs.readFile(filePath, "utf-8")
    const featurePromise = parseFeatureFile(file, fileContent)
    promises.push(featurePromise)
  }

  return await Promise.all(promises)
}
