import fs from "node:fs/promises"
import path from "node:path"
import { FileContentView } from "@/app/_components/file-view/file-content-view"
import { notFound } from "next/navigation"
import { isFile } from "@/lib/is-file"
import { getDocsFiles } from "@/lib/get-docs-files"
import { DirectoryContents } from "@/app/_components/directory-contents"

type Props = {
  params: Promise<{ files: string[] }>
}

export default async function Page(props: Props) {
  const params = await props.params

  if (params.files.length === 0) {
    notFound()
  }

  const files = await getDocsFiles()

  const currentPath = params.files.join("/")

  const filePath = path.join(process.cwd(), "docs", ...params.files)

  const fileExists = await isFile(filePath)

  if (!fileExists) {
    return <DirectoryContents files={files} currentPath={currentPath} />
  }

  const content = await fs.readFile(filePath, "utf-8")

  return <FileContentView content={content} filePath={filePath} />
}
