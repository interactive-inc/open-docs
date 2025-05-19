"use server"

import fs from "node:fs/promises"
import path from "node:path"
import { revalidatePath } from "next/cache"
import { writeMarkdownFile } from "../../lib/front-matter/write-markdown-file"
import { vData } from "../../lib/models/data"
import { vFeatureFrontMatter } from "../../lib/models/feature-front-matter"
import { toFeatureFrontMatter } from "../../lib/to-feature-front-matter"

type Props = {
  featureId: string
  isDone: boolean
  project: string
}

export async function updateFeatureStatus(props: Props): Promise<void> {
  const baseDirectory = path.join(process.cwd(), "docs/products")

  const dataJsonPath = path.join(baseDirectory, props.project, "data.json")

  const dataJsonText = await fs.readFile(dataJsonPath, "utf-8")

  const dataJson = JSON.parse(dataJsonText)

  const validatedData = vData.parse(dataJson)

  const updatedFeatures = validatedData.features.map((feature) => {
    if (feature.id !== props.featureId) {
      return feature
    }
    return {
      ...feature,
      isDone: props.isDone,
    }
  })

  const updatedData = {
    ...validatedData,
    features: updatedFeatures,
  }

  await fs.writeFile(
    dataJsonPath,
    JSON.stringify(updatedData, null, 2),
    "utf-8",
  )

  const featuresDirectory = path.join(
    baseDirectory,
    `${props.project}/features`,
  )

  await writeMarkdownFile({
    directory: featuresDirectory,
    dataItems: updatedData.features,
    schema: vFeatureFrontMatter,
    prepareFrontMatter: toFeatureFrontMatter,
    findDataItem: (items, key) => items.find((item) => item.id === key),
  })

  revalidatePath("/")
  revalidatePath(`/projects/${props.project}`)
}
