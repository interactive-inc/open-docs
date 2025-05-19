import path from "node:path"
import { createFeatureRecords } from "../lib/create-feature-records.js"
import { createPageRecords } from "../lib/create-page-records.js"
import { writeMarkdownFile } from "../lib/front-matter/write-markdown-file.js"
import { vData } from "../lib/models/data.js"
import { vFeatureFrontMatter } from "../lib/models/feature-front-matter.js"
import { vPageFrontMatter } from "../lib/models/page-front-matter.js"
import { toFeatureFrontMatter } from "../lib/to-feature-front-matter.js"
import { toPageFrontMatter } from "../lib/to-page-front-matter.js"

const CWD = `${__dirname}/..`

export class JsonCommand {
  private getBaseDirectory() {
    return path.join(CWD, "docs/products")
  }

  private getProjectPath(project: string) {
    return path.join(this.getBaseDirectory(), project)
  }

  private getDataJsonPath(project: string) {
    return path.join(this.getProjectPath(project), "data.json")
  }

  async generateProjectJson(project: string) {
    const projectPath = this.getProjectPath(project)

    const pages = await createPageRecords({
      directory: path.join(projectPath, "pages"),
    })

    const features = await createFeatureRecords({
      directory: path.join(projectPath, "features"),
    })

    const data = { pages, features }
    const text = JSON.stringify(data, null, 2)
    const outputPath = this.getDataJsonPath(project)

    await Bun.file(outputPath).write(text)

    return data
  }

  async applyProjectJson(project: string) {
    const dataJsonPath = this.getDataJsonPath(project)
    const rawDataJson = await Bun.file(dataJsonPath).json()
    const dataJson = vData.parse(rawDataJson)
    const projectPath = this.getProjectPath(project)

    const pagesDirectory = path.join(projectPath, "pages")
    await writeMarkdownFile({
      directory: pagesDirectory,
      dataItems: dataJson.pages,
      schema: vPageFrontMatter,
      prepareFrontMatter: toPageFrontMatter,
      findDataItem: (items, key) => items.find((item) => item.id === key),
    })

    const featuresDirectory = path.join(projectPath, "features")
    await writeMarkdownFile({
      directory: featuresDirectory,
      dataItems: dataJson.features,
      schema: vFeatureFrontMatter,
      prepareFrontMatter: toFeatureFrontMatter,
      findDataItem: (items, key) => items.find((item) => item.id === key),
    })

    return dataJson
  }

  async getProjectJson(project: string) {
    const dataJsonPath = this.getDataJsonPath(project)
    try {
      const rawDataJson = await Bun.file(dataJsonPath).json()
      return vData.parse(rawDataJson)
    } catch (error) {
      return null
    }
  }

  async updateProjectJson(project: string, data: unknown) {
    try {
      const validatedData = vData.parse(data)
      const text = JSON.stringify(validatedData, null, 2)
      const outputPath = this.getDataJsonPath(project)
      await Bun.file(outputPath).write(text)
      return validatedData
    } catch (error) {
      return null
    }
  }
}
