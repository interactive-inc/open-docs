import path from "node:path"
import { vData } from "../models/data"
import { vFeatureFrontMatter } from "../models/feature-front-matter"
import { vPageFrontMatter } from "../models/page-front-matter"
import { toFeatureFrontMatter } from "../to-feature-front-matter"
import { toPageFrontMatter } from "../to-page-front-matter"
import { writeMarkdownFiles } from "../write-markdown-files"

const baseDirectory = path.join(process.cwd(), "docs/products")

const projects = ["client"]

for (const directory of projects) {
  const dataJsonPath = path.join(baseDirectory, directory, "data.json")

  const rawDataJson = await Bun.file(dataJsonPath).json()

  const dataJson = vData.parse(rawDataJson)

  const pagesDirectory = path.join(baseDirectory, `${directory}/pages`)

  await writeMarkdownFiles({
    directory: pagesDirectory,
    dataItems: dataJson.pages,
    schema: vPageFrontMatter,
    prepareFrontMatter: toPageFrontMatter,
    findDataItem: (items, key) => items.find((item) => item.id === key),
  })

  const featuresDirectory = path.join(baseDirectory, `${directory}/features`)

  await writeMarkdownFiles({
    directory: featuresDirectory,
    dataItems: dataJson.features,
    schema: vFeatureFrontMatter,
    prepareFrontMatter: toFeatureFrontMatter,
    findDataItem: (items, key) => items.find((item) => item.id === key),
  })

  console.log(`✅ データを適用しました: ${directory}`)
}
