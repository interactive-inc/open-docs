import { useMutation } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { apiClient } from "@/lib/api-client"
import { normalizePath } from "@/lib/path-utils"
import type { DocFile, DocFileMd } from "@/lib/types"

function isDocFileMd(file: DocFile): file is DocFileMd {
  return "frontMatter" in file && "title" in file
}

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

  if (!props.files || props.files.length === 0) {
    return null
  }

  const handleRestore = (filePath: string) => {
    restoreFileMutation.mutate(filePath)
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2"
        variant={"secondary"}
      >
        <span>📦</span>
        <span>
          {props.files.filter(isDocFileMd).length}
          件のファイルが整理されています。
        </span>
        <span className="text-xs">{isExpanded ? "▼" : "▶"}</span>
      </Button>
      {isExpanded && (
        <Card className="gap-0 rounded-md p-0">
          <div className="divide-y">
            {props.files.filter(isDocFileMd).map((file) => (
              <div
                key={file.path.path}
                className="flex items-center justify-between p-2"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    <Link
                      to="/$"
                      params={{ _splat: normalizePath(file.path.path) }}
                      className="text-blue-600 hover:underline"
                    >
                      {file.content.title || file.path.name}
                    </Link>
                  </div>
                  {file.content.description && (
                    <div className="text-xs">{file.content.description}</div>
                  )}
                </div>
                <Button
                  variant={"outline"}
                  size={"sm"}
                  onClick={() => handleRestore(file.path.path)}
                  disabled={restoreFileMutation.isPending}
                >
                  {"復元"}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
