import { useEffect, useState } from "react"
import { DirectoryFileListView } from "@/components/directory-file-list-view"
import { DirectoryTableView } from "@/components/directory-table-view"
import { SidebarButton } from "@/components/sidebar-button"
import { EmojiPicker } from "@/components/ui/emoji-picker"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { VscodeButton } from "@/components/vscode-button"
import { useDirectoryQuery } from "@/hooks/use-directory-query"
import { apiClient } from "@/lib/api-client"
import type {
  DocCustomSchema,
  DocFile,
  DocFileMd,
  DocFileUnknown,
  DocMetaFieldType,
} from "@/lib/types"

/**
 * テーブルカラムの型定義
 */
type DocTableColumn = {
  key: string
  label: string
  type: DocMetaFieldType
  path: string
  options: string[] | number[]
}

function isDocFileMd(file: DocFile): file is DocFileMd<DocCustomSchema> {
  return file.type === "markdown"
}

function isDocFileUnknown(file: DocFile): file is DocFileUnknown {
  return file.type === "unknown"
}

function hasIsArchived(
  file: DocFile,
): file is DocFileMd<DocCustomSchema> | DocFileUnknown {
  return file.type === "markdown" || file.type === "unknown"
}

type Props = {
  currentPath: string
}

export function DirectoryPageView(props: Props) {
  const query = useDirectoryQuery(props.currentPath)

  const directoryData = query.data

  // アーカイブファイルの表示状態
  const [showArchived, setShowArchived] = useState(false)

  // ファイルをタイプ別にフィルタリング
  const allMdFiles = directoryData.files.filter((file) =>
    isDocFileMd(file as DocFile),
  )

  const activeMdFiles = allMdFiles.filter((file) => {
    return !hasIsArchived(file as DocFile) || !file.isArchived
  })

  const archivedMdFiles = allMdFiles.filter((file) => {
    return hasIsArchived(file as DocFile) && file.isArchived
  })

  // 表示するファイルを決定
  const mdFiles = showArchived ? allMdFiles : activeMdFiles

  const otherFiles = directoryData.files.filter((file) => {
    const docFile = file as DocFile
    return (
      isDocFileUnknown(docFile) &&
      (hasIsArchived(docFile) ? !docFile.isArchived : true)
    )
  })

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("📁")

  useEffect(() => {
    if (directoryData?.indexFile) {
      setTitle(directoryData.indexFile.content.title || "")
      setDescription(directoryData.indexFile.content.description || "")
      setIcon(directoryData.indexFile.content.meta?.icon || "📁")
    }
  }, [directoryData])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleTitleBlur = async () => {
    await apiClient.api.directories[":path{.+}"].$put({
      param: {
        path: props.currentPath.startsWith("/")
          ? props.currentPath.substring(1)
          : props.currentPath,
      },
      json: {
        title: title,
        description: null,
        icon: null,
        schema: null,
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
        path: props.currentPath.startsWith("/")
          ? props.currentPath.substring(1)
          : props.currentPath,
      },
      json: {
        title: null,
        description: description,
        icon: null,
        schema: null,
      },
    })
  }

  const handleIconSelect = async (newIcon: string) => {
    setIcon(newIcon)
    try {
      const response = await apiClient.api.directories[":path{.+}"].$put({
        param: {
          path: props.currentPath.startsWith("/")
            ? props.currentPath.substring(1)
            : props.currentPath,
        },
        json: {
          title: null,
          description: null,
          icon: newIcon,
          schema: null,
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
              filePath={directoryData.indexFile.path.fullPath}
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
          files={mdFiles as DocFile[]}
          columns={(() => {
            const schema = directoryData.indexFile?.content.meta?.schema
            if (!schema) return []

            const columns = Object.entries(schema)
              .map(([key, fieldValue]) => {
                // fieldValueが正しいオブジェクトであることを確認
                if (
                  !fieldValue ||
                  typeof fieldValue !== "object" ||
                  !("type" in fieldValue)
                ) {
                  return null
                }

                const value = fieldValue as Record<string, unknown>
                return {
                  key,
                  label: typeof value.title === "string" ? value.title : key,
                  type: String(value.type) as DocTableColumn["type"],
                  path:
                    (value.type === "relation" ||
                      value.type === "multi-relation") &&
                    typeof value.path === "string"
                      ? value.path
                      : "",
                  options: Array.isArray(value.options) ? value.options : [],
                }
              })
              .filter((col): col is NonNullable<typeof col> => col !== null)
            return columns
          })()}
          directoryPath={props.currentPath}
          relations={directoryData.relations}
          onDataChanged={() => query.refetch()}
          archivedCount={archivedMdFiles.length}
          showArchived={showArchived}
          onToggleArchived={() => setShowArchived(!showArchived)}
        />
        <DirectoryFileListView
          files={otherFiles as DocFile[]}
          onDataChanged={() => query.refetch()}
        />
      </div>
    </div>
  )
}
