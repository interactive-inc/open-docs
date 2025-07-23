import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Archive, ArchiveRestore, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { EditableTableCell } from "@/components/editable-table-cell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { apiClient } from "@/lib/api-client"
import { normalizePath } from "@/lib/path-utils"
import type {
  DocFile,
  DocFileMd,
  DocRelation,
  DocSchemaFieldType,
} from "@/lib/types"

/**
 * テーブルカラムの型定義
 */
type DocTableColumn = {
  key: string
  label: string
  type: DocSchemaFieldType
  path: string
  options: string[] | number[]
}

function isDocFileMd(file: DocFile): file is DocFileMd {
  return file.type === "markdown"
}

type Props = {
  files: DocFile[]
  columns: DocTableColumn[]
  directoryPath: string
  onDataChanged?: () => void
  relations?: DocRelation[]
  archivedCount?: number
  showArchived?: boolean
  onToggleArchived?: () => void
}

export function DirectoryTableView(props: Props) {
  const queryClient = useQueryClient()
  const [deleteConfirmFiles, setDeleteConfirmFiles] = useState<Set<string>>(
    new Set(),
  )

  const createFileMutation = useMutation({
    async mutationFn() {
      const endpoint = apiClient.api.files
      const resp = await endpoint.$post({
        json: {
          directoryPath: normalizePath(props.directoryPath),
        },
      })

      return resp.json()
    },
    onSuccess() {
      // ファイルツリーキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ["file-tree"] })

      if (!props.onDataChanged) return
      props.onDataChanged()
    },
  })

  const updateCellMutation = useMutation({
    async mutationFn(params: { path: string; field: string; value: unknown }) {
      console.log("Updating cell:", params)
      try {
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

        console.log("Response status:", resp.status)

        if (!resp.ok) {
          const errorText = await resp.text()
          console.error("Response error:", errorText)
          throw new Error(`API Error: ${resp.status} - ${errorText}`)
        }

        const result = await resp.json()
        console.log("Update response:", result)
        return result
      } catch (error) {
        console.error("Update request failed:", error)
        throw error
      }
    },
    onSuccess() {
      // キャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ["file-tree"] })
      queryClient.invalidateQueries({ queryKey: ["directory"] })

      if (!props.onDataChanged) return
      props.onDataChanged()
    },
    onError(error) {
      console.error("Update mutation failed:", error)
    },
  })

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
      if (!props.onDataChanged) return
      props.onDataChanged()
    },
  })

  const deleteFileMutation = useMutation({
    async mutationFn(filePath: string) {
      // パスを正規化
      const normalizedPath = normalizePath(filePath)

      // apiClientを使用して削除
      const endpoint = apiClient.api.files[":path{.+}"]
      const resp = await endpoint.$delete({
        param: { path: normalizedPath },
      })

      if (!resp.ok) {
        const errorText = await resp.text()
        throw new Error(`Failed to delete file: ${errorText}`)
      }

      return resp.json()
    },
    onSuccess() {
      // ファイルツリーキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ["file-tree"] })

      if (!props.onDataChanged) return
      props.onDataChanged()
    },
  })

  const archiveFileMutation = useMutation({
    async mutationFn(filePath: string) {
      // パスを正規化
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
      // ファイルツリーキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ["file-tree"] })

      if (!props.onDataChanged) return
      props.onDataChanged()
    },
  })

  const restoreFileMutation = useMutation({
    async mutationFn(filePath: string) {
      // パスを正規化
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
      // ファイルツリーキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ["file-tree"] })

      if (!props.onDataChanged) return
      props.onDataChanged()
    },
  })

  const handleDeleteClick = (filePath: string) => {
    if (deleteConfirmFiles.has(filePath)) {
      // 2回目のクリック - ファイルを削除
      deleteFileMutation.mutate(filePath)
      setDeleteConfirmFiles(new Set())
    } else {
      // 1回目のクリック - 確認状態にする
      setDeleteConfirmFiles(new Set([filePath]))
    }
  }

  const handleArchiveClick = (filePath: string) => {
    archiveFileMutation.mutate(filePath)
  }

  const handleRestoreClick = (filePath: string) => {
    restoreFileMutation.mutate(filePath)
  }

  return (
    <Card className="gap-0 overflow-x-scroll rounded-md p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">ファイル名</TableHead>
            <TableHead className="min-w-64">タイトル</TableHead>
            {props.columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.files.filter(isDocFileMd).map((fileData) => {
            const isArchived = "isArchived" in fileData && fileData.isArchived
            return (
              <TableRow
                key={fileData.path.path}
                className={isArchived ? "opacity-60" : ""}
              >
                <TableCell className="font-medium">
                  <Link
                    to="/$"
                    params={{ _splat: normalizePath(fileData.path.path) }}
                    className="text-blue-600 hover:underline"
                  >
                    {fileData.path.name}
                  </Link>
                </TableCell>
                <TableCell className="p-0">
                  <EditableTableCell
                    value={fileData.content.title || ""}
                    type="string"
                    onUpdate={(newValue) => {
                      return updateTitleMutation.mutate({
                        path: fileData.path.path,
                        title: String(newValue),
                      })
                    }}
                  />
                </TableCell>
                {props.columns.map((column) => {
                  // リレーション情報を取得
                  const relationData = props.relations?.find(
                    (rel) => rel.path === column.path,
                  )

                  const cellValue = fileData.content.frontMatter?.[column.key]

                  return (
                    <TableCell key={column.key} className="p-1">
                      <EditableTableCell
                        value={cellValue}
                        type={column.type}
                        path={column.path}
                        relationOptions={relationData?.files}
                        selectOptions={column.options}
                        onUpdate={(newValue) => {
                          return updateCellMutation.mutate({
                            path: fileData.path.path,
                            field: column.key,
                            value: newValue,
                          })
                        }}
                      />
                    </TableCell>
                  )
                })}
                <TableCell className="p-2">
                  <div className="flex justify-end gap-1">
                    {!isArchived && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleArchiveClick(fileData.path.path)}
                        disabled={archiveFileMutation.isPending}
                        className="h-8 w-8 p-0"
                        title="アーカイブする"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                    {isArchived && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRestoreClick(fileData.path.path)}
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
                        deleteConfirmFiles.has(fileData.path.path)
                          ? "destructive"
                          : "ghost"
                      }
                      onClick={() => handleDeleteClick(fileData.path.path)}
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
          })}
        </TableBody>
      </Table>
      <div className="flex gap-2 border-t p-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => createFileMutation.mutate()}
          disabled={createFileMutation.isPending}
        >
          <Plus className="h-4 w-4" />
          {"新しいファイル"}
        </Button>
        {(props.archivedCount ?? 0) > 0 && (
          <Button
            size="sm"
            variant={props.showArchived ? "default" : "outline"}
            onClick={props.onToggleArchived}
          >
            {props.showArchived
              ? `表示中（${props.archivedCount}件）`
              : `非表示（${props.archivedCount}件）`}
          </Button>
        )}
      </div>
    </Card>
  )
}
