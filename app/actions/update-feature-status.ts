"use server"

import fs from "node:fs/promises"
import path from "node:path"
import { toMarkdownText } from "@/lib/markdown/to-markdown-text"
import { revalidatePath } from "next/cache"
import { parseMarkdown } from "../../lib/markdown/parse-markdown"
import { vFeatureFrontMatter } from "../../lib/models/feature-front-matter"

type Props = {
  featureId: string
  isDone: boolean
  project: string
}

export async function updateFeatureStatus(props: Props): Promise<void> {
  const baseDirectory = path.join(process.cwd(), "docs/products")

  const filePath = path.join(
    baseDirectory,
    `${props.project}/features/${props.featureId}.md`,
  )

  const fileContent = await fs.readFile(filePath, "utf-8")

  const markdown = parseMarkdown(fileContent)

  if (markdown.frontMatter === null) {
    throw new Error()
  }

  const frontMatter = vFeatureFrontMatter.parse({
    ...markdown.frontMatter,
    "is-done": props.isDone ? "true" : "false",
  })

  const markdownText = toMarkdownText({
    content: markdown.content,
    frontMatter: frontMatter,
  })

  await fs.writeFile(filePath, markdownText, "utf-8")

  revalidatePath("/")
  revalidatePath(`/projects/${props.project}`)
}
