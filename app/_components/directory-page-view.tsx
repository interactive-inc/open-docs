"use client"
import { DirectoryTableView } from "@/app/_components/directory-table-view"
import { SidebarButton } from "@/app/_components/sidebar-button"
import { EmojiPicker } from "@/app/_components/ui/emoji-picker"
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

  const [title, setTitle] = useState(directoryData.indexFile.title || "")

  const [description, setDescription] = useState(
    directoryData.indexFile.description || "",
  )

  const [icon, setIcon] = useState(
    (directoryData.indexFile.frontMatter.icon as string) || "📁",
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
        description: null,
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
        title: null,
        description: description,
      },
    })
  }

  const handleIconSelect = async (newIcon: string) => {
    setIcon(newIcon)
    await apiClient.api.directories[":path{.+}"].$put({
      param: {
        path: props.currentPath,
      },
      json: {
        properties: { icon: newIcon },
        title: null,
        description: null,
      },
    })
    // キャッシュを更新して最新データを取得
    query.refetch()
  }

  return (
    <div className="h-full overflow-x-hidden">
      <div className="space-y-2 p-4">
        <div className="flex items-center gap-2">
          <SidebarButton />
          {directoryData.indexFile && (
            <VscodeButton
              cwd={directoryData.cwd}
              filePath={directoryData.indexFile.path}
              size="icon"
              variant="outline"
            />
          )}
          <EmojiPicker currentIcon={icon} onIconSelect={handleIconSelect} />
          <Input
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            placeholder="タイトルを入力"
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
          files={directoryData.files}
          columns={directoryData.indexFile.columns || []}
          directoryPath={props.currentPath}
          relations={directoryData.relations}
          onDataChanged={() => query.refetch()}
        />
        {directoryData.archiveInfo?.hasArchive && (
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm">
              <span>📦</span>
              <span>
                {directoryData.archiveInfo.archiveFileCount}
                件のファイルが整理されています。
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
