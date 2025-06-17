"use client"

import { Button } from "@/app/_components/ui/button"
import { Card } from "@/app/_components/ui/card"
import { apiClient } from "@/lib/system/api-client"
import type { DocFileMd } from "@/lib/types"
import { useMutation } from "@tanstack/react-query"
import Link from "next/link"
import { useState } from "react"

type Props = {
  files: DocFileMd[]
  directoryPath: string
  refetch: () => void
}

export function ArchivedFileListView(props: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  const restoreFileMutation = useMutation({
    async mutationFn(filePath: string) {
      const endpoint = apiClient.api.files[":path{.+}"]
      const resp = await endpoint.$put({
        param: { path: filePath.replace(/^docs\//, "") },
        json: {
          properties: null,
          body: null,
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
        <span>{props.files.length}件のファイルが整理されています。</span>
        <span className="text-xs">{isExpanded ? "▼" : "▶"}</span>
      </Button>
      {isExpanded && (
        <Card className="gap-0 rounded-md p-0">
          <div className="divide-y">
            {props.files.map((file) => (
              <div
                key={file.path}
                className="flex items-center justify-between p-2"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    <Link
                      href={`/${file.path}`}
                      className="text-blue-600 hover:underline"
                    >
                      {file.title || file.fileName}
                    </Link>
                  </div>
                  {file.description && (
                    <div className="text-xs">{file.description}</div>
                  )}
                </div>
                <Button
                  variant={"outline"}
                  size={"sm"}
                  onClick={() => handleRestore(file.path)}
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
