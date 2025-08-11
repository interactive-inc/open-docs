import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { startTransition, useContext, useState } from "react"
import { ArchivedFileListView } from "@/components/archived-file-list-view"
import { DirectoryFileListView } from "@/components/directory-file-list-view"
import { DirectoryTableView } from "@/components/directory-table/directory-table-view"
import { SidebarButton } from "@/components/sidebar-button"
import { EmojiPicker } from "@/components/ui/emoji-picker"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { VscodeButton } from "@/components/vscode-button"
import { RootStateContext } from "@/contexts/root-state"
import { apiClient } from "@/lib/api-client"
import { getDirectoryPath } from "@/lib/open-csv/get-directory-path"

type Props = {
  currentPath: string
}

const endpoint = apiClient.api.directories[":path{.+}"]

const directoryEndpoint = apiClient.api.directories[":path{.+}"]

export function DirectoryPageView(props: Props) {
  const rootStateQuery = useContext(RootStateContext)

  const directoryPath = getDirectoryPath(props.currentPath)

  const path = directoryPath.startsWith("/")
    ? directoryPath.substring(1)
    : directoryPath

  const query = useSuspenseQuery({
    queryKey: [endpoint.$url({ param: { path } })],
    async queryFn() {
      const resp = await endpoint.$get({ param: { path } })
      return resp.json()
    },
  })

  const updateDirectoryMutation = useMutation({
    async mutationFn(params: {
      title: string | null
      description: string | null
      icon: string | null
      schema: Record<string, unknown> | null
    }) {
      const response = await directoryEndpoint.$put({
        param: { path: props.currentPath },
        json: {
          title: params.title,
          description: params.description,
          icon: params.icon,
          schema: params.schema,
        },
      })
      return response.json()
    },
    async onSuccess() {
      query.refetch()
      startTransition(async () => {
        rootStateQuery.refetch()
      })
    },
  })

  const [title, setTitle] = useState(query.data.indexFile.content.title)

  const [description, setDescription] = useState(() => {
    return query.data.indexFile.content.description
  })

  const [icon, setIcon] = useState(() => {
    return query.data.indexFile.content.meta.icon ?? "📂"
  })

  // ファイルをタイプ別にフィルタリング
  const allMdFiles = query.data.files.filter((file) => {
    return file.type === "markdown"
  })

  // アーカイブされていないMarkdownファイル
  const activeMdFiles = allMdFiles.filter((file) => {
    return !file.isArchived
  })

  // アーカイブされたMarkdownファイル
  const archivedMdFiles = allMdFiles.filter((file) => {
    return file.isArchived
  })

  const otherFiles = query.data.files.filter((file) => {
    return file.type === "unknown"
  })

  const onChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const onBlurTitle = () => {
    updateDirectoryMutation.mutate({
      title: title,
      description: null,
      icon: null,
      schema: null,
    })
  }

  const onChangeDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value)
  }

  const onBlurDescription = () => {
    updateDirectoryMutation.mutate({
      title: null,
      description: description,
      icon: null,
      schema: null,
    })
  }

  const onSelectIcon = (newIcon: string) => {
    setIcon(newIcon)
    updateDirectoryMutation.mutate({
      title: null,
      description: null,
      icon: newIcon,
      schema: null,
    })
  }

  return (
    <div className="h-full overflow-x-hidden">
      <div className="space-y-2 p-2">
        <div className="flex items-center gap-2">
          <SidebarButton />
          {query.data.indexFile && (
            <VscodeButton
              filePath={query.data.indexFile.path.fullPath}
              size="icon"
              variant="outline"
            />
          )}
          <EmojiPicker currentIcon={icon} onIconSelect={onSelectIcon} />
          <Input
            value={title}
            onChange={onChangeTitle}
            onBlur={onBlurTitle}
            placeholder="タイトルを入力"
            className="flex-1"
          />
        </div>
        <Textarea
          value={description}
          onChange={onChangeDescription}
          onBlur={onBlurDescription}
          placeholder="説明を入力"
          rows={2}
        />
        <DirectoryTableView
          files={activeMdFiles}
          schema={query.data.indexFile.content.meta.schema}
          directoryPath={props.currentPath}
          relations={query.data.relations}
          onDataChanged={() => query.refetch()}
        />
        <ArchivedFileListView
          files={archivedMdFiles}
          directoryPath={props.currentPath}
          refetch={() => query.refetch()}
        />
        <DirectoryFileListView
          files={otherFiles}
          onDataChanged={() => query.refetch()}
        />
      </div>
    </div>
  )
}
