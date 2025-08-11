import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Archive, ArchiveRestore, Trash2 } from "lucide-react"
import { useContext, useState } from "react"
import { DirectoryTableCell } from "@/components/directory-table/directory-table-cell"
import { EditableTableCell } from "@/components/editable-table-cell/editable-table-cell"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { RootStateContext } from "@/contexts/root-state"
import { apiClient } from "@/lib/api-client"
import type { DocFileIndexSchema, DocFileMdAny, DocRelation } from "@/lib/types"
import { normalizePath } from "@/utils"

type Props = {
  file: DocFileMdAny
  schema: DocFileIndexSchema
  relations?: DocRelation[]
  isArchived: boolean
  deleteConfirmFiles: Set<string>
  onDataChanged?: () => void
}

export function DirectoryTableRow(props: Props) {
  const queryClient = useQueryClient()

  const { refetch } = useContext(RootStateContext)

  const [deleteConfirmed, setDeleteConfirmed] = useState(false)

  const updateTitleMutation = useMutation({
    async mutationFn(params: { path: string; title: string }) {
      const endpoint = apiClient.api.files[":path{.+}"]
      const resp = await endpoint.$put({
        param: { path: params.path },
        json: {
          title: params.title,
          properties: null,
          content: null,
          description: null,
          isArchived: null,
        },
      })
      return resp.json()
    },
    onSuccess() {
      refetch()
      if (!props.onDataChanged) return
      props.onDataChanged()
    },
  })

  const updateCellMutation = useMutation({
    async mutationFn(params: { path: string; field: string; value: unknown }) {
      const endpoint = apiClient.api.files[":path{.+}"]
      const resp = await endpoint.$put({
        param: { path: params.path },
        json: {
          properties: { [params.field]: params.value },
          content: null,
          title: null,
          description: null,
          isArchived: null,
        },
      })
      return resp.json()
    },
    onSuccess() {
      // キャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ["file-tree"] })
      queryClient.invalidateQueries({ queryKey: ["directory"] })
      refetch()
      if (!props.onDataChanged) return
      props.onDataChanged()
    },
  })

  const archiveFileMutation = useMutation({
    async mutationFn(filePath: string) {
      const normalizedPath = normalizePath(filePath)
      const endpoint = apiClient.api.files[":path{.+}"]
      const resp = await endpoint.$put({
        param: { path: normalizedPath },
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
      queryClient.invalidateQueries({ queryKey: ["file-tree"] })
      refetch()
      if (!props.onDataChanged) return
      props.onDataChanged()
    },
  })

  const restoreFileMutation = useMutation({
    async mutationFn(filePath: string) {
      const normalizedPath = normalizePath(filePath)
      const endpoint = apiClient.api.files[":path{.+}"]
      const resp = await endpoint.$put({
        param: { path: normalizedPath },
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
      queryClient.invalidateQueries({ queryKey: ["file-tree"] })
      refetch()
      if (!props.onDataChanged) return
      props.onDataChanged()
    },
  })

  const deleteFileMutation = useMutation({
    async mutationFn(filePath: string) {
      const normalizedPath = normalizePath(filePath)
      const endpoint = apiClient.api.files[":path{.+}"]
      const resp = await endpoint.$delete({
        param: { path: normalizedPath },
      })
      return resp.json()
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["file-tree"] })
      refetch()
      if (!props.onDataChanged) return
      props.onDataChanged()
      setDeleteConfirmed(false)
    },
  })

  const handleUpdateTitle = (path: string, title: string) => {
    updateTitleMutation.mutate({ path, title })
  }

  const handleUpdateCell = (path: string, field: string, value: unknown) => {
    updateCellMutation.mutate({ path, field, value })
  }

  const handleArchive = (path: string) => {
    archiveFileMutation.mutate(path)
  }

  const handleRestore = (path: string) => {
    restoreFileMutation.mutate(path)
  }

  const handleDelete = (path: string) => {
    if (props.deleteConfirmFiles.has(path) || deleteConfirmed) {
      deleteFileMutation.mutate(path)
    } else {
      setDeleteConfirmed(true)
    }
  }

  if (props.file.type !== "markdown") return null

  const columns = Object.keys(props.schema).map((key) => {
    if (props.schema[key] === undefined) {
      throw new Error(`Schema key "${key}" is undefined`)
    }
    return { key: key, schema: props.schema[key] }
  })

  return (
    <TableRow
      key={props.file.path.path}
      className={props.isArchived ? "opacity-60" : ""}
    >
      <TableCell className="font-medium">
        <Link
          to="/$"
          params={{ _splat: normalizePath(props.file.path.path) }}
          className="text-blue-600 hover:underline"
        >
          {props.file.path.name}
        </Link>
      </TableCell>
      <TableCell className="p-0">
        <EditableTableCell
          value={props.file.content.title || ""}
          type="string"
          onUpdate={(newValue) => {
            return handleUpdateTitle(props.file.path.path, String(newValue))
          }}
        />
      </TableCell>
      {columns.map((column) => (
        <DirectoryTableCell
          key={column.key}
          columnKey={column.key}
          schema={column.schema}
          value={props.file.content.meta[column.key]}
          relations={props.relations}
          onUpdate={(field, value) => {
            return handleUpdateCell(props.file.path.path, field, value)
          }}
        />
      ))}
      <TableCell className="p-2">
        <div className="flex justify-end gap-1">
          {!props.isArchived && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleArchive(props.file.path.path)}
              disabled={archiveFileMutation.isPending}
              className="h-8 w-8 p-0"
              title="アーカイブする"
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
          {props.isArchived && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRestore(props.file.path.path)}
              disabled={restoreFileMutation.isPending}
              className="h-8 w-8 p-0"
              title="復元する"
            >
              <ArchiveRestore className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant={
              props.deleteConfirmFiles.has(props.file.path.path)
                ? "destructive"
                : "ghost"
            }
            onClick={() => handleDelete(props.file.path.path)}
            disabled={deleteFileMutation.isPending}
            className="h-8 w-8 p-0"
            title="削除する"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
