import fs from "node:fs/promises"
import path from "node:path"
import { DirectoryContents } from "@/app/_components/directory-contents"
import { FileContentView } from "@/app/_components/file-view/file-content-view"
import { getDocsFiles } from "@/lib/get-docs-files"
import { notFound } from "next/navigation"
import { isFile } from "@/lib/is-file"

type Props = {
  params: Promise<{ directories: string[] }>
}

export default async function Page(props: Props) {
  const params = await props.params

  if (params.directories.length === 0) {
    notFound()
  }

  const files = await getDocsFiles()

  const currentPath = params.directories.join("/")

  const filePath = path.join(process.cwd(), "docs", currentPath)

  const fileExists = await isFile(filePath)

  if (!fileExists) {
    return <DirectoryContents files={files} currentPath={currentPath} />
  }

  const content = await fs.readFile(filePath, "utf-8")

  return <FileContentView content={content} filePath={filePath} />
}
