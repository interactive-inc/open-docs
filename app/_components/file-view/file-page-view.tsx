"use client"

import { FileContentView } from "@/app/_components/file-view/file-content-view"
import { ReloadButton } from "@/app/_components/reload-button"
import { SidebarButton } from "@/app/_components/sidebar-button"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { VscodeButton } from "@/app/_components/vscode-button"
import { apiClient } from "@/lib/api-client"
import { useFileQuery } from "@/lib/hooks/use-file-query"
import { useDirectoryQuery } from "@/lib/hooks/use-directory-query"
import { useFilePropertiesMutation } from "@/lib/hooks/use-file-properties-mutation"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
  filePath: string
}

export function FilePageView(props: Props) {
  const router = useRouter()

  const fileQuery = useFileQuery(props.filePath)

  const directoryQuery = useDirectoryQuery(props.filePath)

  const fileData = fileQuery.data

  const directorySchema = directoryQuery.data.indexFile.frontMatter.schema || {}

  const relations = directoryQuery.data.relations || []

  const [currentContent, setCurrentContent] = useState(fileData.content)

  // APIから取得したタイトルを使用、なければファイル名を使用
  const getInitialTitle = () => {
    if (fileData.title) return fileData.title
    return fileData.path.split("/").pop()?.replace(/\.md$/, "") || ""
  }

  const [title, setTitle] = useState(getInitialTitle())

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
    // リロード時はAPIから返されたタイトルを使用
    if (result.data.title === null) return
    setTitle(result.data.title)
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

  const handleBackClick = () => {
    // ファイルパスからディレクトリパスを取得
    const pathSegments = props.filePath.split("/")
    pathSegments.pop() // ファイル名を除去
    const directoryPath = pathSegments.join("/")
    router.push(`/${directoryPath}`)
  }

  return (
    <div className="space-y-2 p-4">
      <div className="flex items-center gap-2">
        <SidebarButton />
        <VscodeButton
          cwd={directoryQuery.data.cwd}
          filePath={fileData.path}
          size="icon"
          variant="outline"
        />
        <Button onClick={handleBackClick} size="icon" variant="outline">
          <ArrowLeft className="h-4 w-4" />
        </Button>
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
          disabled={fileQuery.isLoading}
        />
      </div>
      <div className="h-full">
        <FileContentView
          fileData={fileData}
          currentContent={currentContent}
          onChange={onChange}
          onFrontMatterUpdate={handleFrontMatterUpdate}
          schema={directorySchema}
          relations={relations}
        />
      </div>
    </div>
  )
}
