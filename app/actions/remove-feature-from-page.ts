"use server"

import fs from "node:fs/promises"
import path from "node:path"
import { revalidatePath } from "next/cache"
import { writeMarkdownFile } from "../../lib/front-matter/write-markdown-file"
import { vData } from "../../lib/models/data"
import { vPageFrontMatter } from "../../lib/models/page-front-matter"
import { toPageFrontMatter } from "../../lib/to-page-front-matter"

type Props = {
  pageId: string
  featureId: string
  project: string
}

export async function removeFeatureFromPage(props: Props): Promise<void> {
  const baseDirectory = path.join(process.cwd(), "docs/products")

  const dataJsonPath = path.join(baseDirectory, props.project, "data.json")

  const dataJsonText = await fs.readFile(dataJsonPath, "utf-8")

  const dataJson = JSON.parse(dataJsonText)

  const validatedData = vData.parse(dataJson)

  const updatedPages = validatedData.pages.map((page) => {
    if (page.id !== props.pageId) {
      return page
    }

    return {
      ...page,
      features: page.features.filter((feature) => feature !== props.featureId),
    }
  })

  const updatedData = {
    ...validatedData,
    pages: updatedPages,
  }

  await fs.writeFile(
    dataJsonPath,
    JSON.stringify(updatedData, null, 2),
    "utf-8",
  )

  const pagesDirectory = path.join(baseDirectory, `${props.project}/pages`)

  await writeMarkdownFile({
    directory: pagesDirectory,
    dataItems: updatedData.pages,
    schema: vPageFrontMatter,
    prepareFrontMatter: toPageFrontMatter,
    findDataItem: (items, key) => items.find((item) => item.id === key),
  })

  revalidatePath("/")
  revalidatePath(`/projects/${props.project}`)
}
