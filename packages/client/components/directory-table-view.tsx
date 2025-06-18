import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Archive, Plus, Trash2 } from "lucide-react"
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
import type { DocFileMd, DocRelation, DocTableColumn } from "@/lib/types"

type Props = {
  files: DocFileMd[]
  columns: DocTableColumn[]
  directoryPath: string
  onDataChanged?: () => void
  relations?: DocRelation[]
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
          directoryPath: props.directoryPath,
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
      const endpoint = apiClient.api.files[":path{.+}"]
      const resp = await endpoint.$put({
        param: { path: params.path },
        json: {
          properties: { [params.field]: params.value },
          body: null,
          title: null,
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

  const updateTitleMutation = useMutation({
    async mutationFn(params: { path: string; title: string }) {
      const endpoint = apiClient.api.files[":path{.+}"]
      const resp = await endpoint.$put({
        param: { path: params.path },
        json: {
          title: params.title,
          properties: null,
          body: null,
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
      // パスを正規化（docs/プレフィックスを削除）
      const normalizedPath = formatPath(filePath)

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
      // パスを正規化（docs/プレフィックスを削除）
      const normalizedPath = formatPath(filePath)

      const endpoint = apiClient.api.files[":path{.+}"]
      const resp = await endpoint.$put({
        param: { path: normalizedPath },
        json: {
          properties: null,
          body: null,
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

  const formatPath = (path: string) => {
    // 絶対パスの場合は相対パスに変換
    if (path.includes("/docs/")) {
      return path.split("/docs/")[1] ?? ""
    }
    // docs/ プレフィックスを除去
    return path.replace(/^docs\//, "")
  }

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
          {props.files.map((fileData) => {
            return (
              <TableRow
                key={fileData.id || fileData.relativePath || fileData.path}
              >
                <TableCell className="font-medium">
                  <Link
                    href={`/${formatPath(fileData.relativePath || "")}`}
                    className="text-blue-600 hover:underline"
                  >
                    {fileData.fileName}
                  </Link>
                </TableCell>
                <TableCell className="p-0">
                  <EditableTableCell
                    value={fileData.title || ""}
                    type="string"
                    onUpdate={(newValue) => {
                      return updateTitleMutation.mutate({
                        path: fileData.id || "",
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

                  const cellValue = (
                    fileData.frontMatter as Record<string, unknown>
                  )?.[column.key]

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
                            path: fileData.id || "",
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
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleArchiveClick(fileData.id)}
                      disabled={archiveFileMutation.isPending}
                      className="h-8 w-8 p-0"
                      title="アーカイブする"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        deleteConfirmFiles.has(fileData.id)
                          ? "destructive"
                          : "ghost"
                      }
                      onClick={() => handleDeleteClick(fileData.id)}
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
      <div className="border-t p-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => createFileMutation.mutate()}
          disabled={createFileMutation.isPending}
        >
          <Plus className="h-4 w-4" />
          {"新しいファイル"}
        </Button>
      </div>
    </Card>
  )
}
