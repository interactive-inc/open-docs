"use server"

import fs from "node:fs/promises"
import path from "node:path"

type Props = {
  filePath: string
  content: string
}

export async function saveFileContent(props: Props) {
  const docsPath = path.join(process.cwd(), "docs")

  const absolutePath = props.filePath

  const isInDocsDir = absolutePath.startsWith(docsPath)

  if (!isInDocsDir) {
    throw new Error("Invalid file path: File must be in docs directory")
  }

  const directory = path.dirname(absolutePath)

  await fs.mkdir(directory, { recursive: true })

  await fs.writeFile(absolutePath, props.content, "utf-8")

  return props.content
}
