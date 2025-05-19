"use server"

import fs from "node:fs/promises"
import path from "node:path"
import { toMarkdownText } from "@/lib/markdown/to-markdown-text"
import { revalidatePath } from "next/cache"
import { parseMarkdown } from "../../lib/markdown/parse-markdown"
import { vPageFrontMatter } from "../../lib/models/page-front-matter"

type Props = {
  pageId: string
  featureId: string
  project: string
}

export async function removeFeatureFromPage(props: Props): Promise<void> {
  const baseDirectory = path.join(process.cwd(), "docs/products")

  const filePath = path.join(
    baseDirectory,
    `${props.project}/pages/${props.pageId}.md`,
  )

  const fileContent = await fs.readFile(filePath, "utf-8")

  const markdown = parseMarkdown(fileContent)

  if (markdown.frontMatter === null) {
    throw new Error()
  }

  const currentFrontMatter = markdown.frontMatter

  const currentFeatures = Array.isArray(currentFrontMatter.features)
    ? currentFrontMatter.features
    : []

  const updatedFeatures = currentFeatures.filter((feature) => {
    return feature !== props.featureId
  })

  const frontMatter = vPageFrontMatter.parse({
    ...markdown.frontMatter,
    features: updatedFeatures,
  })

  const markdownText = toMarkdownText({
    content: markdown.content,
    frontMatter: frontMatter,
  })

  await fs.writeFile(filePath, markdownText, "utf-8")

  revalidatePath("/")
  revalidatePath(`/projects/${props.project}`)
}
