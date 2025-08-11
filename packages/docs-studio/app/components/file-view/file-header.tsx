import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { ReloadButton } from "@/components/reload-button"
import { SidebarButton } from "@/components/sidebar-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VscodeButton } from "@/components/vscode-button"
import { apiClient } from "@/lib/api-client"
import { normalizePath } from "@/utils"

type Props = {
  filePath: string
  fileData: {
    path: string
    title: string | null
  }
  onReload: () => void
  isLoading: boolean
  children?: React.ReactNode
}

export function FileHeader(props: Props) {
  const navigate = useNavigate()

  const getInitialTitle = () => {
    if (props.fileData.title) return props.fileData.title
    return props.filePath.split("/").pop()?.replace(/\.md$/, "") || ""
  }

  const [title, setTitle] = useState(getInitialTitle())

  // propsが変更されたときにタイトルを更新
  // biome-ignore lint/correctness/useExhaustiveDependencies: getInitialTitle depends on props
  useEffect(() => {
    setTitle(getInitialTitle())
  }, [props.fileData.title, props.filePath])

  const updateTitleMutation = useMutation({
    async mutationFn(newTitle: string) {
      const normalizedPath = normalizePath(props.filePath)

      await apiClient.api.files[":path{.+}"].$put({
        param: {
          path: normalizedPath,
        },
        json: {
          title: newTitle,
          properties: null,
          content: null,
          description: null,
          isArchived: null,
        },
      })
    },
    onSuccess() {
      props.onReload()
    },
  })

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
  }

  const handleTitleBlur = async () => {
    if (props.fileData.path.endsWith(".md")) {
      updateTitleMutation.mutate(title)
    }
  }

  const handleBackClick = () => {
    const pathSegments = props.filePath.split("/")
    pathSegments.pop()

    // アーカイブディレクトリ（_）を削除
    const filteredSegments = pathSegments.filter((segment) => segment !== "_")
    const directoryPath = filteredSegments.join("/")

    navigate({ to: `/${directoryPath}` })
  }

  return (
    <div className="flex items-center gap-2">
      <SidebarButton />
      <VscodeButton
        filePath={props.fileData.path}
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
        onReload={props.onReload}
        size="icon"
        variant="outline"
        disabled={props.isLoading}
      />
      {props.children}
    </div>
  )
}
