import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { DirectoryTableRow } from "@/components/directory-table/directory-table-row"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { apiClient } from "@/lib/api-client"
import type { DocFileIndexSchema, DocFileMdAny, DocRelation } from "@/lib/types"
import { normalizePath } from "@/utils"

type Props = {
  files: DocFileMdAny[]
  schema: DocFileIndexSchema
  directoryPath: string
  onDataChanged?: () => void
  relations?: DocRelation[]
  archivedCount?: number
  showArchived?: boolean
  onToggleArchived?: () => void
}

export function DirectoryTableView(props: Props) {
  const queryClient = useQueryClient()

  const [deleteConfirmFiles] = useState<Set<string>>(new Set())

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

  const columns = Object.keys(props.schema).map((key) => {
    if (props.schema[key] === undefined) {
      throw new Error(`Schema key "${key}" is undefined`)
    }
    return { key: key, schema: props.schema[key] }
  })

  return (
    <Card className="gap-0 overflow-x-scroll rounded-md p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">ファイル名</TableHead>
            <TableHead className="min-w-64">タイトル</TableHead>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.key}</TableHead>
            ))}
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.files.map((fileData) => {
            const isArchived = "isArchived" in fileData && fileData.isArchived
            return (
              <DirectoryTableRow
                key={fileData.path.path}
                file={fileData}
                schema={props.schema}
                relations={props.relations}
                isArchived={isArchived}
                deleteConfirmFiles={deleteConfirmFiles}
                onDataChanged={props.onDataChanged}
              />
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
