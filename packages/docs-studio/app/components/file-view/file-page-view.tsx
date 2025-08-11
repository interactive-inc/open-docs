import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"
import { CsvFileView } from "@/components/file-view/csv-file-view"
import { DefaultFileViewer } from "@/components/file-view/default-file-view"
import { JsonFileEditor } from "@/components/file-view/json-file-editor"
import { MarkdownFileView } from "@/components/file-view/markdown-file-view"
import { apiClient } from "@/lib/api-client"
import { getDirectoryPath } from "@/lib/open-csv/get-directory-path"
import { normalizePath } from "@/utils"

type Props = {
  filePath: string
}

export function FilePageView(props: Props) {
  const fileEndpoint = apiClient.api.files[":path{.+}"]

  const filePathParam = normalizePath(props.filePath)

  const fileQuery = useSuspenseQuery({
    queryKey: [fileEndpoint.$url({ param: { path: filePathParam } })],
    async queryFn() {
      const resp = await fileEndpoint.$get({ param: { path: filePathParam } })
      return resp.json()
    },
  })

  // ディレクトリデータの取得
  const directoryEndpoint = apiClient.api.directories[":path{.+}"]
  const directoryPath = getDirectoryPath(props.filePath)
  const dirPath = normalizePath(directoryPath)

  const directoryQuery = useSuspenseQuery({
    queryKey: [directoryEndpoint.$url({ param: { path: dirPath } })],
    async queryFn() {
      try {
        const resp = await directoryEndpoint.$get({ param: { path: dirPath } })
        return resp.json()
      } catch (error) {
        // INDEX_NOT_FOUNDエラーの場合は空のデータを返す
        if (error instanceof Error && error.message === "INDEX_NOT_FOUND") {
          return { indexFile: null, relations: [] }
        }
        throw error
      }
    },
  })

  const fileData = fileQuery.data

  const directorySchemaValue =
    directoryQuery.data?.indexFile?.content?.meta?.schema

  const directorySchema = directorySchemaValue || {}

  const relations = directoryQuery.data?.relations || []

  // contentがオブジェクトの場合はbodyプロパティを使用
  const initialContent =
    typeof fileData?.content === "string"
      ? fileData.content
      : fileData?.content?.body || ""

  const [currentContent, setCurrentContent] = useState(initialContent)

  // フロントマター更新のためのmutation
  const updateProperties = useMutation({
    async mutationFn(params: { path: string; field: string; value: unknown }) {
      const path = normalizePath(params.path)

      const properties = { [params.field]: params.value }

      const response = await fileEndpoint.$put({
        param: { path },
        json: {
          properties,
          content: null,
          title: null,
          description: null,
          isArchived: null,
        },
      })

      return response.json()
    },
  })

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

  const onReload = async () => {
    const result = await fileQuery.refetch()
    if (result.data === undefined) return
    const content =
      typeof result.data.content === "string"
        ? result.data.content
        : result.data.content?.body || ""
    setCurrentContent(content)
  }

  const onUpdateMeta = async (key: string, value: unknown) => {
    await updateProperties.mutateAsync({
      path: props.filePath,
      field: key,
      value: value,
    })
    onReload()
  }

  if (!fileData) {
    return <div>ファイルが見つかりません</div>
  }

  // pathオブジェクトから実際のパス文字列を取得
  const filePath =
    typeof fileData.path === "string" ? fileData.path : fileData.path?.path

  if (fileData.type === "markdown") {
    return (
      <main className="p-2">
        <MarkdownFileView
          filePath={props.filePath}
          fileData={{ path: filePath, title: fileData.content.title || null }}
          content={currentContent}
          onChange={onChange}
          meta={fileData.content.meta || {}}
          onFrontMatterUpdate={onUpdateMeta}
          onReload={onReload}
          isLoading={fileQuery.isLoading}
          schema={directorySchema}
          relations={relations}
        />
      </main>
    )
  }

  if (fileData.type === "unknown" && filePath.endsWith(".csv")) {
    return (
      <main className="p-2">
        <CsvFileView
          filePath={props.filePath}
          fileData={{ path: filePath, title: null }}
          content={currentContent}
          onChange={onChange}
          onReload={onReload}
          isLoading={fileQuery.isLoading}
        />
      </main>
    )
  }

  if (fileData.type === "unknown" && filePath.endsWith(".json")) {
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
