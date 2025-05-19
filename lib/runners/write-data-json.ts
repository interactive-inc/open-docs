import fs from "node:fs/promises"
import path from "node:path"
import { createFeatureRecords } from "../create-feature-records"
import { createPageRecords } from "../create-page-records"
import { parseMarkdown } from "../markdown/parse-markdown"
import { readMarkdownFiles } from "../read-markdown-files"

const baseDirectory = path.join(process.cwd(), "docs/products")

const projects = ["client"]

// マイルストーンファイルをパースする関数
async function parseMilestoneFile(file: string, content: string) {
  const id = file.replace(".md", "")
  const markdown = parseMarkdown(content)

  if (!markdown.frontMatter) {
    throw new Error(`Frontmatter not found in file: ${file}`)
  }

  const frontMatter = markdown.frontMatter

  return {
    id,
    title: frontMatter.title as string,
    description: frontMatter.description as string,
  }
}

// マイルストーンレコードを作成する関数
async function createMilestoneRecords(directory: string) {
  const milestonesPath = path.resolve(directory)

  try {
    const mdFiles = await readMarkdownFiles(milestonesPath)

    const promises = []

    for (const file of mdFiles) {
      const filePath = path.join(milestonesPath, file)
      const fileContent = await fs.readFile(filePath, "utf-8")
      const milestonePromise = parseMilestoneFile(file, fileContent)
      promises.push(milestonePromise)
    }

    return await Promise.all(promises)
  } catch (error) {
    console.error("Error creating milestone records:", error)
    return []
  }
}

for (const directory of projects) {
  const pages = await createPageRecords({
    directory: path.join(baseDirectory, `${directory}/pages`),
  })

  const features = await createFeatureRecords({
    directory: path.join(baseDirectory, `${directory}/features`),
  })

  const milestones = await createMilestoneRecords(
    path.join(baseDirectory, `${directory}/milestones`),
  )

  const data = { pages, features, milestones }

  const text = JSON.stringify(data, null, 2)

  const outputPath = path.join(baseDirectory, directory, "data.json")

  await Bun.file(outputPath).write(text)
}
