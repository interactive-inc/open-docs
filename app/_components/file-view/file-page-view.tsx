"use client"

import { CsvFileView } from "@/app/_components/file-view/csv-file-view"
import { DefaultFileViewer } from "@/app/_components/file-view/default-file-view"
import { JsonFileEditor } from "@/app/_components/file-view/json-file-editor"
import { MarkdownFileView } from "@/app/_components/file-view/markdown-file-view"
import { useDirectoryQuery } from "@/app/_hooks/use-directory-query"
import { useFilePropertiesMutation } from "@/app/_hooks/use-file-properties-mutation"
import { useFileQuery } from "@/app/_hooks/use-file-query"
import { apiClient } from "@/lib/system/api-client"
import { useState } from "react"

type Props = {
  filePath: string
}

export function FilePageView(props: Props) {
  const fileQuery = useFileQuery(props.filePath)

  const directoryQuery = useDirectoryQuery(props.filePath)

  const fileData = fileQuery.data

  const directorySchema = directoryQuery.data.indexFile.frontMatter.schema || {}

  const relations = directoryQuery.data.relations || []

  const [currentContent, setCurrentContent] = useState(fileData.content)

  const updateProperties = useFilePropertiesMutation()

  const onChange = async (newContent: string) => {
    const normalizedPath = props.filePath.replace(/^docs\//, "")

    const result = await apiClient.api.files[":path{.+}"].$put({
      param: { path: normalizedPath },
      json: {
        title: null,
        properties: null,
        body: newContent,
        description: null,
        isArchived: null,
      },
    })

    const data = await result.json()
    if ("content" in data && typeof data.content === "string") {
      setCurrentContent(data.content)
    }
  }

  const handleReload = async () => {
    const result = await fileQuery.refetch()
    if (result.data === undefined) return
    setCurrentContent(result.data.content)
  }

  const handleFrontMatterUpdate = async (key: string, value: unknown) => {
    await updateProperties.mutateAsync({
      path: props.filePath,
      field: key,
      value: value,
    })
    // フロントマター更新後にファイル内容を再取得
    handleReload()
  }

  if (fileData.path.endsWith(".md")) {
    return (
      <main className="p-2">
        <MarkdownFileView
          filePath={props.filePath}
          fileData={fileData}
          cwd={directoryQuery.data.cwd}
          content={currentContent}
          onChange={onChange}
          frontMatter={fileData.frontMatter}
          onFrontMatterUpdate={handleFrontMatterUpdate}
          onReload={handleReload}
          isLoading={fileQuery.isLoading}
          schema={directorySchema}
          relations={relations}
        />
      </main>
    )
  }

  if (fileData.path.endsWith(".csv")) {
    return (
      <main className="p-2">
        <CsvFileView
          filePath={props.filePath}
          fileData={fileData}
          cwd={directoryQuery.data.cwd}
          content={currentContent}
          onChange={onChange}
          onReload={handleReload}
          isLoading={fileQuery.isLoading}
        />
      </main>
    )
  }

  if (fileData.path.endsWith(".json")) {
    return (
      <main className="p-2">
        <JsonFileEditor content={currentContent} />
      </main>
    )
  }

  return (
    <main className="p-2">
      <DefaultFileViewer content={currentContent} />
    </main>
  )
}
