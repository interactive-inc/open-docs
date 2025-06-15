"use client"

import { EditableTableCell } from "@/app/_components/editable-table-cell"
import { Button } from "@/app/_components/ui/button"
import { Card } from "@/app/_components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table"
import { apiClient } from "@/lib/api-client"
import type { DirectoryFile } from "@/lib/types"
import type { TableColumn } from "@/lib/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Archive, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

type Props = {
  files: DirectoryFile[]
  columns: TableColumn[]
  directoryPath: string
  onDataChanged?: () => void
  relations?: Array<{
    path: string
    files: Array<{
      value: string
      label: string
      path: string
    }>
  }>
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
    async mutationFn(params: {
      path: string
      field: string
      value: unknown
    }) {
      const endpoint = apiClient.api.files[":path{.+}"]
      const resp = await endpoint.$put({
        param: { path: params.path.replace(/^docs\//, "") },
        json: {
          properties: { [params.field]: params.value },
          body: null,
          title: null,
          description: null,
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
    async mutationFn(params: {
      path: string
      title: string
    }) {
      const endpoint = apiClient.api.files[":path{.+}"]
      const resp = await endpoint.$put({
        param: { path: params.path.replace(/^docs\//, "") },
        json: {
          title: params.title,
          properties: null,
          body: null,
          description: null,
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
      const path = filePath.replace(/^docs\//, "")
      // パスの各セグメントを個別にエンコードしてから結合
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
      // ファイルツリーキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ["file-tree"] })

      if (!props.onDataChanged) return
      props.onDataChanged()
    },
  })

  const archiveFileMutation = useMutation({
    async mutationFn(filePath: string) {
      const endpoint = apiClient.api.files.archive
      const resp = await endpoint.$post({
        json: {
          path: formatPath(filePath),
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
              <TableRow key={fileData.path}>
                <TableCell className="font-medium">
                  <Link
                    href={`/${formatPath(fileData.path || "")}`}
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
                        path: fileData.path || "",
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
                            path: fileData.path || "",
                            field: column.key,
                            value: newValue,
                          })
                        }}
                      />
                    </TableCell>
                  )
                })}
                <TableCell className="p-2">
                  <div className="flex gap-1 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleArchiveClick(fileData.path)}
                      disabled={archiveFileMutation.isPending}
                      className="h-8 w-8 p-0"
                      title="アーカイブする"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        deleteConfirmFiles.has(fileData.path)
                          ? "destructive"
                          : "ghost"
                      }
                      onClick={() => handleDeleteClick(fileData.path)}
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
