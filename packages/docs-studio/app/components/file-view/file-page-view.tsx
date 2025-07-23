import { useState } from "react"
import { CsvFileView } from "@/components/file-view/csv-file-view"
import { DefaultFileViewer } from "@/components/file-view/default-file-view"
import { JsonFileEditor } from "@/components/file-view/json-file-editor"
import { MarkdownFileView } from "@/components/file-view/markdown-file-view"
import { useDirectoryQuery } from "@/hooks/use-directory-query"
import { useFilePropertiesMutation } from "@/hooks/use-file-properties-mutation"
import { useFileQuery } from "@/hooks/use-file-query"
import { apiClient } from "@/lib/api-client"
import { normalizePath } from "@/lib/path-utils"

type Props = {
  filePath: string
}

export function FilePageView(props: Props) {
  const fileQuery = useFileQuery(props.filePath)

  const directoryQuery = useDirectoryQuery(props.filePath)

  const fileData = fileQuery.data

  const directorySchema =
    directoryQuery.data?.indexFile?.content?.frontMatter?.schema || {}

  const relations = directoryQuery.data?.relations || []

  // contentがオブジェクトの場合はbodyプロパティを使用
  const initialContent =
    typeof fileData?.content === "string"
      ? fileData.content
      : fileData?.content?.body || ""
  const [currentContent, setCurrentContent] = useState(initialContent)

  const updateProperties = useFilePropertiesMutation()

  const onChange = async (newContent: string) => {
    const normalizedPath = normalizePath(props.filePath)

    const result = await apiClient.api.files[":path{.+}"].$put({
      param: { path: normalizedPath },
      json: {
        title: null,
        properties: null,
        content: newContent,
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
    const content =
      typeof result.data.content === "string"
        ? result.data.content
        : result.data.content?.body || ""
    setCurrentContent(content)
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

  // pathオブジェクトから実際のパス文字列を取得
  const filePath =
    typeof fileData.path === "string" ? fileData.path : fileData.path?.path

  if (filePath?.endsWith(".md")) {
    return (
      <main className="p-2">
        <MarkdownFileView
          filePath={props.filePath}
          fileData={{ path: filePath, title: fileData.content.title || null }}
          cwd={directoryQuery.data.cwd}
          content={currentContent}
          onChange={onChange}
          frontMatter={(() => {
            // frontMatterはcontent内にある
            const fm = fileData.content.frontMatter || {}
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

  if (filePath?.endsWith(".csv")) {
    return (
      <main className="p-2">
        <CsvFileView
          filePath={props.filePath}
          fileData={{ path: filePath, title: fileData.content.title || null }}
          cwd={directoryQuery.data.cwd}
          content={currentContent}
          onChange={onChange}
          onReload={handleReload}
          isLoading={fileQuery.isLoading}
        />
      </main>
    )
  }

  if (filePath?.endsWith(".json")) {
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
