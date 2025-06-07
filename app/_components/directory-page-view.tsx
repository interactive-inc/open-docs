"use client"
import { DirectoryTableView } from "@/app/_components/directory-table-view"
import { SidebarButton } from "@/app/_components/sidebar-button"
import { Input } from "@/app/_components/ui/input"
import { Textarea } from "@/app/_components/ui/textarea"
import { VscodeButton } from "@/app/_components/vscode-button"
import { apiClient } from "@/lib/api-client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"

type Props = {
  currentPath: string
}

export function DirectoryPageView(props: Props) {
  const query = useSuspenseQuery({
    queryKey: ["directory-data", props.currentPath],
    queryFn: async () => {
      const response = await apiClient.api.directories[":path{.+}"].$get({
        param: {
          path: props.currentPath,
        },
      })
      return response.json()
    },
  })

  const directoryData = query.data

  // H1からタイトルを取得、なければディレクトリ名を使用
  const getInitialTitle = () => {
    if (directoryData.title) return directoryData.title
    return directoryData.directoryName || ""
  }

  const [title, setTitle] = useState(getInitialTitle())

  const [description, setDescription] = useState(
    directoryData.description || "",
  )

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleTitleBlur = async () => {
    await apiClient.api.directories[":path{.+}"].$put({
      param: {
        path: props.currentPath,
      },
      json: {
        properties: null,
        title: title,
      },
    })
  }

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setDescription(e.target.value)
  }

  const handleDescriptionBlur = async () => {
    await apiClient.api.directories[":path{.+}"].$put({
      param: {
        path: props.currentPath,
      },
      json: {
        properties: null,
        description: description,
      },
    })
  }

  const handleCellUpdate = async (
    path: string,
    field: string,
    value: unknown,
  ) => {
    const response = await apiClient.api.files[":path{.+}"].$put({
      param: { path: path.replace(/^docs\//, "") },
      json: {
        properties: { [field]: value },
        body: null,
        title: null,
        description: null,
      },
    })
    if (!response.ok) {
      console.error("Failed to update cell")
    } else {
      // セル更新後にディレクトリデータを再取得
      query.refetch()
    }
  }

  if (directoryData.markdownFilePaths.length === 0) {
    return (
      <div className="p-4">
        <h1 className="mb-4 font-bold text-xl">
          {directoryData.directoryName}
        </h1>
        <div className="text-center text-gray-500">
          このディレクトリにはMarkdownファイルがありません
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-x-hidden">
      <div className="space-y-2 p-4">
        <div className="flex items-center gap-2">
          <SidebarButton />
          {directoryData.indexPath && (
            <VscodeButton
              cwd={directoryData.cwd}
              filePath={directoryData.indexPath}
              size="icon"
              variant="outline"
            />
          )}
          <Input
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            placeholder={directoryData.directoryName}
            className="flex-1"
          />
        </div>
        <Textarea
          value={description}
          onChange={handleDescriptionChange}
          onBlur={handleDescriptionBlur}
          placeholder="説明を入力"
          rows={2}
        />
        <DirectoryTableView
          files={directoryData.markdownFilePaths}
          schema={directoryData.schema}
          onUpdate={handleCellUpdate}
          fileContents={directoryData.files}
        />
      </div>
    </div>
  )
}
