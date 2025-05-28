import fs from "node:fs/promises"
import path from "node:path"
import type { z } from "zod"
import type { zPage } from "./models/page"
import { parsePageFile } from "./parse-page-file"
import { readMarkdownFiles } from "./read-markdown-files"

type Props = {
  directory: string
}

export async function createPageRecords(props: Props) {
  const pagesPath = path.resolve(props.directory)

  const mdFiles = await readMarkdownFiles(pagesPath)

  const promises: Promise<z.infer<typeof zPage>>[] = []

  for (const file of mdFiles) {
    const filePath = path.join(pagesPath, file)
    const fileContent = await fs.readFile(filePath, "utf-8")
    const pagePromise = parsePageFile(file, fileContent)
    promises.push(pagePromise)
  }

  return await Promise.all(promises)
}
