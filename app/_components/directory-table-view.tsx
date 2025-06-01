"use client"

import { EditableTableCell } from "@/app/_components/editable-table-cell"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table"
import type { SchemaDefinition } from "@/lib/types/schema-types"
import { useSuspenseQueries } from "@tanstack/react-query"
import Link from "next/link"

type Props = {
  files: string[]
  schema?: SchemaDefinition | null
  onUpdate: (path: string, field: string, value: unknown) => void
  fileContents?: Array<{
    path: string
    frontMatter: Record<string, unknown>
    content: string
  }>
}

export function DirectoryTableView(props: Props) {
  // fileContentsが提供されている場合は、それを使用
  const filesData = props.fileContents || []

  // fileContentsが提供されていない場合のみ、個別にフェッチ
  const queries = useSuspenseQueries({
    queries: props.fileContents
      ? []
      : props.files.map((filePath) => ({
          queryKey: ["file-content", filePath.replace(/^docs\//, "")],
          queryFn: async () => {
            const normalizedPath = filePath.replace(/^docs\//, "")
            const response = await fetch(`/api/files/${normalizedPath}`)
            if (!response.ok) {
              throw new Error("Failed to fetch file")
            }
            return response.json()
          },
        })),
  })

  const formatPath = (path: string) => {
    return path.replace(/^docs\//, "")
  }

  // スキーマからカラムを生成
  const columns = props.schema
    ? Object.entries(props.schema).map(([key, field]) => ({
        key,
        label: field.description || key,
        type: field.type,
      }))
    : []

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">ファイル名</TableHead>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.files.map((filePath, index) => {
            // fileContentsから対応するデータを取得、または個別クエリの結果を使用
            const data = props.fileContents
              ? filesData.find((f) => f.path === filePath)
              : queries[index]?.data

            const fileName =
              (filePath || "").split("/").pop()?.replace(".md", "") || ""

            return (
              <TableRow key={filePath}>
                <TableCell className="font-medium">
                  <Link
                    href={`/directories/${formatPath(filePath || "")}`}
                    className="text-blue-600 hover:underline"
                  >
                    {fileName}
                  </Link>
                </TableCell>
                {columns.map((column) => {
                  const value = data?.frontMatter?.[column.key]

                  return (
                    <TableCell key={column.key} className="p-0">
                      <EditableTableCell
                        value={value}
                        type={column.type}
                        onUpdate={async (newValue) => {
                          props.onUpdate(filePath || "", column.key, newValue)
                        }}
                      />
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
