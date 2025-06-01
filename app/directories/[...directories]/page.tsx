import fs from "node:fs/promises"
import path from "node:path"
import { DirectoryTableView } from "@/app/_components/directory-table-view"
import { FileContentView } from "@/app/_components/file-view/file-content-view"
import { getDocsFiles } from "@/lib/get-docs-files"
import { isFile } from "@/lib/is-file"
import { parseMarkdown } from "@/lib/markdown/parse-markdown"
import { directoryFrontMatterSchema } from "@/lib/validations/directory-front-matter-schema"
import { notFound } from "next/navigation"

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
    // index.mdからスキーマとメタデータを読み込む
    let schema = null
    let title = null
    let description = null
    const indexPath = path.join("docs", currentPath, "index.md")

    let indexExists = false
    try {
      const indexFullPath = path.join(process.cwd(), indexPath)
      const indexContent = await fs.readFile(indexFullPath, "utf-8")
      const { frontMatter } = parseMarkdown(indexContent)
      if (frontMatter) {
        const validatedFrontMatter =
          directoryFrontMatterSchema.parse(frontMatter)
        schema = validatedFrontMatter.schema
        title = validatedFrontMatter.title
        description = validatedFrontMatter.description
      }
      indexExists = true
    } catch {
      // index.mdがないか、スキーマがない場合はスキップ
    }

    return (
      <DirectoryTableView
        key={currentPath} // パスが変わったらコンポーネントを再作成
        files={files}
        currentPath={currentPath}
        schema={schema}
        title={title}
        description={description}
        indexPath={indexExists ? indexPath : undefined}
      />
    )
  }

  const content = await fs.readFile(filePath, "utf-8")

  return <FileContentView content={content} filePath={filePath} />
}
