import { useMutation } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Archive, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import type { DocFileUnknown } from "@/lib/types"
import { normalizePath } from "@/utils"

type Props = {
  file: DocFileUnknown
  onDataChanged?: () => void
}

export function FileCard(props: Props) {
  const [deleteConfirmFiles, setDeleteConfirmFiles] = useState<Set<string>>(
    new Set(),
  )

  const deleteFileMutation = useMutation({
    async mutationFn(filePath: string) {
      const path = normalizePath(filePath)
      const pathSegments = path
        .split("/")
        .map((segment) => encodeURIComponent(segment))
      const encodedPath = pathSegments.join("/")
      const resp = await fetch(`/api/files/${encodedPath}`, {
        method: "DELETE",
      })

      if (!resp.ok) {
        const errorText = await resp.text()
        throw new Error(`Failed to delete file: ${errorText}`)
      }

      return resp.json()
    },
    onSuccess() {
      if (!props.onDataChanged) return
      props.onDataChanged()
    },
  })

  const archiveFileMutation = useMutation({
    async mutationFn(filePath: string) {
      const endpoint = apiClient.api.files[":path{.+}"]
      const resp = await endpoint.$put({
        param: { path: normalizePath(filePath) },
        json: {
          properties: null,
          content: null,
          title: null,
          description: null,
          isArchived: true,
        },
      })

      return resp.json()
    },
    onSuccess() {
      if (!props.onDataChanged) return
      props.onDataChanged()
    },
  })

  const handleDeleteClick = (filePath: string) => {
    if (deleteConfirmFiles.has(filePath)) {
      deleteFileMutation.mutate(filePath)
      setDeleteConfirmFiles(new Set())
    } else {
      setDeleteConfirmFiles(new Set([filePath]))
    }
  }

  const handleArchiveClick = (filePath: string) => {
    archiveFileMutation.mutate(filePath)
  }

  return (
    <div className="flex items-center justify-between">
      <Link
        to="/$"
        params={{ _splat: normalizePath(props.file.path.path) }}
        className="text-blue-600 hover:underline"
      >
        {props.file.path.name}
      </Link>
      <div className="flex items-center gap-2">
        <span className="text-sm uppercase opacity-50">
          {props.file.extension}
        </span>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleArchiveClick(props.file.path.path)}
            disabled={archiveFileMutation.isPending}
            className="h-8 w-8 p-0"
            title="アーカイブする"
          >
            <Archive className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={
              deleteConfirmFiles.has(props.file.path.path)
                ? "destructive"
                : "ghost"
            }
            onClick={() => handleDeleteClick(props.file.path.path)}
            disabled={deleteFileMutation.isPending}
            className="h-8 w-8 p-0"
            title="削除する"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
