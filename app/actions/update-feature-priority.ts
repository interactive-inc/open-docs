"use server"

import fs from "node:fs/promises"
import path from "node:path"
import { toMarkdownText } from "@/lib/markdown/to-markdown-text"
import { revalidatePath } from "next/cache"
import { parseMarkdown } from "../../lib/markdown/parse-markdown"
import { vFeatureFrontMatter } from "../../lib/models/feature-front-matter"

type Props = {
  featureId: string
  primary: string
  project: string
}

export async function updateFeaturePriority(props: Props): Promise<void> {
  const baseDirectory = path.join(process.cwd(), "docs/products")

  const featureFilePath = path.join(
    baseDirectory,
    `${props.project}/features/${props.featureId}.md`,
  )

  const fileContent = await fs.readFile(featureFilePath, "utf-8")

  const markdown = parseMarkdown(fileContent)

  if (markdown.frontMatter === null) {
    throw new Error(`フロントマターが見つかりません: ${featureFilePath}`)
  }

  const priorityValue =
    props.primary === "high" ? "0" : props.primary === "medium" ? "1" : "2"

  const frontMatter = vFeatureFrontMatter.parse({
    ...markdown.frontMatter,
    priority: priorityValue,
  })

  const markdownText = toMarkdownText({
    content: markdown.content,
    frontMatter: frontMatter,
  })

  await fs.writeFile(featureFilePath, markdownText, "utf-8")

  revalidatePath("/")
  revalidatePath(`/projects/${props.project}`)
}
