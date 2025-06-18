import { useState } from "react"
import { CsvFileView } from "@/components/file-view/csv-file-view"
import { DefaultFileViewer } from "@/components/file-view/default-file-view"
import { JsonFileEditor } from "@/components/file-view/json-file-editor"
import { MarkdownFileView } from "@/components/file-view/markdown-file-view"
import { useDirectoryQuery } from "@/hooks/use-directory-query"
import { useFilePropertiesMutation } from "@/hooks/use-file-properties-mutation"
import { useFileQuery } from "@/hooks/use-file-query"
import { apiClient } from "@/lib/api-client"

type Props = {
  filePath: string
}

export function FilePageView(props: Props) {
  const fileQuery = useFileQuery(props.filePath)

  const directoryQuery = useDirectoryQuery(props.filePath)

  const fileData = fileQuery.data

  const directorySchema =
    directoryQuery.data?.indexFile?.frontMatter?.schema || {}

  const relations = directoryQuery.data?.relations || []

  const [currentContent, setCurrentContent] = useState(fileData?.content || "")

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

  if (!fileData) {
    return <div>ファイルが見つかりません</div>
  }

  if (fileData.path?.endsWith(".md")) {
    return (
      <main className="p-2">
        <MarkdownFileView
          filePath={props.filePath}
          fileData={{ path: fileData.path, title: fileData.title }}
          cwd={directoryQuery.data.cwd}
          content={currentContent}
          onChange={onChange}
          frontMatter={(() => {
            const fm = fileData.frontMatter || {}
            // スキーマやアイコンなどの複雑なオブジェクトを除外し、プリミティブ値のみを返す
            const filtered: Record<
              string,
              string | number | boolean | string[] | number[] | boolean[] | null
            > = {}
            for (const [key, value] of Object.entries(fm)) {
              if (key === "schema" || key === "icon") continue
              if (
                typeof value === "string" ||
                typeof value === "number" ||
                typeof value === "boolean" ||
                value === null ||
                (Array.isArray(value) &&
                  value.every(
                    (v) =>
                      typeof v === "string" ||
                      typeof v === "number" ||
                      typeof v === "boolean",
                  ))
              ) {
                filtered[key] = value as
                  | string
                  | number
                  | boolean
                  | string[]
                  | number[]
                  | boolean[]
                  | null
              }
            }
            return filtered
          })()}
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
          fileData={{ path: fileData.path, title: fileData.title }}
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
