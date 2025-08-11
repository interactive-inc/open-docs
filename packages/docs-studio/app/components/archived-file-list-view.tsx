import { useMutation } from "@tanstack/react-query"
import { ArrowDownIcon, ArrowRightIcon } from "lucide-react"
import { useState } from "react"
import { ArchivedFileItem } from "@/components/archived-file-item"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { apiClient } from "@/lib/api-client"
import type { DocFile } from "@/lib/types"
import { normalizePath } from "@/utils"

type Props = {
  files: DocFile[]
  directoryPath: string
  refetch: () => void
}

export function ArchivedFileListView(props: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  const restoreFileMutation = useMutation({
    async mutationFn(filePath: string) {
      const endpoint = apiClient.api.files[":path{.+}"]
      const resp = await endpoint.$put({
        param: { path: normalizePath(filePath) },
        json: {
          properties: null,
          content: null,
          title: null,
          description: null,
          isArchived: false,
        },
      })
      return resp.json()
    },
    onSuccess() {
      props.refetch()
    },
  })

  const onRestore = (filePath: string) => {
    restoreFileMutation.mutate(filePath)
  }

  const mdFiles = props.files.filter((file) => file.type === "markdown")

  return (
    <div className="space-y-2">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-2"
        variant={"secondary"}
      >
        <span className="flex gap-x-2">
          <span>📦</span>
          <span>
            {props.files.filter((file) => file.type === "markdown").length}
            件のファイルが整理されています。
          </span>
        </span>
        {isExpanded ? <ArrowDownIcon /> : <ArrowRightIcon />}
      </Button>
      {isExpanded && (
        <Card className="gap-0 rounded-md p-0">
          <div className="divide-y">
            {mdFiles.map((file) => (
              <ArchivedFileItem
                key={file.path.path}
                file={file}
                onRestore={onRestore}
                isRestorePending={restoreFileMutation.isPending}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
