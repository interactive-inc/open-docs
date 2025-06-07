"use client"

import { FileContentView } from "@/app/_components/file-view/file-content-view"
import { ReloadButton } from "@/app/_components/reload-button"
import { SidebarButton } from "@/app/_components/sidebar-button"
import { Input } from "@/app/_components/ui/input"
import { VscodeButton } from "@/app/_components/vscode-button"
import { apiClient } from "@/lib/api-client"
import { useFileContent } from "@/lib/hooks/use-file-content"
import { useSaveFileContent } from "@/lib/hooks/use-save-file-content"
import { useUpdateProperties } from "@/lib/hooks/use-update-properties"
import { useState } from "react"

type Props = {
  filePath: string
}

export function FilePageView(props: Props) {
  const fileContentQuery = useFileContent(props.filePath)

  const fileData = fileContentQuery.data

  const [currentContent, setCurrentContent] = useState(fileData.content)

  // APIから取得したタイトルを使用、なければファイル名を使用
  const getInitialTitle = () => {
    if (fileData.title) return fileData.title
    return fileData.path.split("/").pop()?.replace(/\.md$/, "") || ""
  }

  const [title, setTitle] = useState(getInitialTitle())

  const saveFileContent = useSaveFileContent()

  const updateProperties = useUpdateProperties()

  const onChange = async (newContent: string) => {
    const result = await saveFileContent.mutateAsync({
      filePath: props.filePath,
      content: newContent,
    })
    if ("content" in result) {
      setCurrentContent(result.content)
    }
  }

  const handleReload = () => {
    fileContentQuery.refetch().then((result) => {
      if (result.data?.content) {
        setCurrentContent(result.data.content)
        // リロード時はAPIから返されたタイトルを使用
        if (result.data.title) {
          setTitle(result.data.title)
        }
      }
    })
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
  }

  const handleTitleBlur = async () => {
    // マークダウンファイルの場合はタイトル更新APIを呼び出し
    if (fileData.path.endsWith(".md")) {
      const normalizedPath = props.filePath.replace(/^docs\//, "")

      await apiClient.api.files[":path{.+}"].$put({
        param: {
          path: normalizedPath,
        },
        json: {
          title: title,
          properties: null,
          body: null,
          description: null,
        },
      })

      handleReload()
    }
  }

  return (
    <div className="space-y-2 p-4">
      <div className="flex items-center gap-2">
        <SidebarButton />
        <VscodeButton
          cwd={fileData.cwd}
          filePath={fileData.path}
          size="icon"
          variant="outline"
        />
        <Input
          value={title}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          placeholder="タイトルを入力"
          className="flex-1"
        />
        <ReloadButton
          onReload={handleReload}
          size="icon"
          variant="outline"
          disabled={fileContentQuery.isLoading}
        />
      </div>
      <div className="h-full">
        <FileContentView
          fileData={fileData}
          currentContent={currentContent}
          onChange={onChange}
          onFrontMatterUpdate={handleFrontMatterUpdate}
        />
      </div>
    </div>
  )
}
