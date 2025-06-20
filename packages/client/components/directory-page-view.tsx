import { useEffect, useState } from "react"
import { ArchivedFileListView } from "@/components/archived-file-list-view"
import { DirectoryFileListView } from "@/components/directory-file-list-view"
import { DirectoryTableView } from "@/components/directory-table-view"
import { SidebarButton } from "@/components/sidebar-button"
import { EmojiPicker } from "@/components/ui/emoji-picker"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { VscodeButton } from "@/components/vscode-button"
import { useDirectoryQuery } from "@/hooks/use-directory-query"
import { apiClient } from "@/lib/api-client"

type Props = {
  currentPath: string
}

export function DirectoryPageView(props: Props) {
  const query = useDirectoryQuery(props.currentPath)

  const directoryData = query.data

  const [title, setTitle] = useState(directoryData?.indexFile?.title || "")

  const [description, setDescription] = useState(
    directoryData?.indexFile?.description || "",
  )

  const [icon, setIcon] = useState(
    directoryData?.indexFile?.frontMatter?.icon || "📁",
  )

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleTitleBlur = async () => {
    await apiClient.api.directories[":path{.+}"].$put({
      param: {
        path: props.currentPath.startsWith("/") ? props.currentPath.substring(1) : props.currentPath,
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
        path: props.currentPath.startsWith("/") ? props.currentPath.substring(1) : props.currentPath,
      },
      json: {
        properties: null,
        title: null,
        description: description,
      },
    })
  }

  const handleIconSelect = async (newIcon: string) => {
    console.log("Selected icon:", newIcon)
    console.log("Current path:", props.currentPath)
    setIcon(newIcon)
    try {
      const response = await apiClient.api.directories[":path{.+}"].$put({
        param: {
          path: props.currentPath.startsWith("/") ? props.currentPath.substring(1) : props.currentPath,
        },
        json: {
          properties: { icon: newIcon },
          title: null,
          description: null,
        },
      })
      const result = await response.json()
      console.log("API response:", result)
      // キャッシュを更新して最新データを取得
      await query.refetch()
    } catch (error) {
      console.error("Error updating icon:", error)
    }
  }

  return (
    <div className="h-full overflow-x-hidden">
      <div className="space-y-2 p-2">
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
          columns={directoryData.indexFile?.columns || []}
          directoryPath={props.currentPath}
          relations={directoryData.relations}
          onDataChanged={() => query.refetch()}
        />
        <DirectoryFileListView
          files={directoryData.otherFiles || []}
          onDataChanged={() => query.refetch()}
        />
        <ArchivedFileListView
          files={directoryData.archivedFiles || []}
          directoryPath={props.currentPath}
          refetch={() => query.refetch()}
        />
      </div>
    </div>
  )
}
