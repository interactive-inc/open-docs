"use client"

import { EditableTableCell } from "@/app/_components/editable-table-cell"
import { Input } from "@/app/_components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table"
import { Textarea } from "@/app/_components/ui/textarea"
import { VscodeButton } from "@/app/_components/vscode-button"
import type { FileNode } from "@/lib/get-docs-files"
import { parseMarkdown } from "@/lib/markdown/parse-markdown"
import type { SchemaDefinition } from "@/lib/types/schema-types"
import Link from "next/link"
import { useEffect, useState } from "react"

type Props = {
  files: FileNode[]
  currentPath: string
  schema?: SchemaDefinition | null
  title?: string | null
  description?: string | null
  indexPath?: string
}

type FileData = {
  fileName: string
  path: string
  frontMatter: Record<string, unknown>
}

export function DirectoryTableView(props: Props) {
  const [fileDataList, setFileDataList] = useState<FileData[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState(props.title || "")
  const [description, setDescription] = useState(props.description || "")

  // keyでコンポーネントが再作成されるので、propsの変更を監視するuseEffectは不要

  const formatPath = (path: string) => {
    return path.replace(/^docs\//, "")
  }

  useEffect(() => {
    async function loadFileData() {
      setLoading(true)

      // パスからディレクトリの内容を取得
      let currentLevel = props.files

      if (props.currentPath && props.currentPath !== "") {
        const parts = props.currentPath.split("/").filter(Boolean)

        for (const part of parts) {
          const directory = currentLevel.find(
            (item) => item.type === "directory" && item.name === part,
          )

          if (!directory || !directory.children) {
            setFileDataList([])
            setLoading(false)
            return
          }

          currentLevel = directory.children
        }
      }

      // ファイルのみをフィルタリング（.mdファイルのみ、README.mdとindex.mdを除く）
      const markdownFiles = currentLevel.filter(
        (item) =>
          item.type === "file" &&
          item.name.endsWith(".md") &&
          item.name !== "README.md" &&
          item.name !== "index.md",
      )

      const dataList: FileData[] = []

      for (const file of markdownFiles) {
        try {
          const response = await fetch(
            `/api/file-content?path=${encodeURIComponent(file.path)}`,
          )
          if (response.ok) {
            const content = await response.text()
            const { frontMatter } = parseMarkdown(content)

            dataList.push({
              fileName: file.name.replace(".md", ""),
              path: file.path,
              frontMatter: frontMatter || {},
            })
          }
        } catch (error) {
          console.error(`Error loading file ${file.path}:`, error)
        }
      }

      setFileDataList(dataList)
      setLoading(false)
    }

    loadFileData()
  }, [props.files, props.currentPath])

  // スキーマからカラムを生成
  const columns = props.schema
    ? Object.entries(props.schema).map(([key, field]) => ({
        key,
        label: field.description || key,
        type: field.type,
      }))
    : []

  if (loading) {
    return <div className="p-4">読み込み中...</div>
  }

  if (fileDataList.length === 0) {
    return (
      <div className="p-4">
        <h1 className="mb-4 font-bold text-xl">{`${props.currentPath || "/"}`}</h1>
        <div className="text-center text-gray-500">
          このディレクトリにはMarkdownファイルがありません
        </div>
      </div>
    )
  }

  const handleTitleChange = async (newTitle: string) => {
    setTitle(newTitle)
    if (!props.indexPath && (newTitle || description)) {
      // index.mdがない場合は作成
      const indexPath = `docs/${props.currentPath}/index.md`
      await createIndexFile(indexPath, newTitle, description)
    } else if (props.indexPath) {
      await updateFrontMatter(props.indexPath, "title", newTitle || undefined)
    }
  }

  const handleDescriptionChange = async (newDescription: string) => {
    setDescription(newDescription)
    if (!props.indexPath && (title || newDescription)) {
      // index.mdがない場合は作成
      const indexPath = `docs/${props.currentPath}/index.md`
      await createIndexFile(indexPath, title, newDescription)
    } else if (props.indexPath) {
      await updateFrontMatter(
        props.indexPath,
        "description",
        newDescription || undefined,
      )
    }
  }

  // パスからディレクトリ名を取得
  const getDirectoryName = () => {
    const parts = props.currentPath.split("/").filter(Boolean)
    return parts[parts.length - 1] || "Root"
  }

  return (
    <div className="space-y-2 p-4">
      <div className="space-y-2">
        <div className="text-muted-foreground text-sm">
          {props.currentPath || "/"}
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={(e) => handleTitleChange(e.target.value)}
            placeholder={getDirectoryName()}
            className="flex-1"
          />
          {props.indexPath && (
            <VscodeButton
              cwd="/Users/n/Documents/open-docs"
              filePath={props.indexPath}
              size="icon"
              variant="outline"
            />
          )}
        </div>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={(e) => handleDescriptionChange(e.target.value)}
          placeholder="説明を入力"
          rows={2}
        />
      </div>
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
            {fileDataList.map((fileData) => (
              <TableRow key={fileData.path}>
                <TableCell className="font-medium">
                  <Link
                    href={`/directories/${formatPath(fileData.path)}`}
                    className="text-blue-600 hover:underline"
                  >
                    {fileData.fileName}
                  </Link>
                </TableCell>
                {columns.map((column) => {
                  const value = fileData.frontMatter[column.key]

                  return (
                    <TableCell key={column.key} className="p-0">
                      <EditableTableCell
                        value={value}
                        type={column.type}
                        onUpdate={async (newValue) => {
                          await updateFrontMatter(
                            fileData.path,
                            column.key,
                            newValue,
                          )
                          // ローカルステートを更新
                          setFileDataList((prev) =>
                            prev.map((fd) =>
                              fd.path === fileData.path
                                ? {
                                    ...fd,
                                    frontMatter: {
                                      ...fd.frontMatter,
                                      [column.key]: newValue,
                                    },
                                  }
                                : fd,
                            ),
                          )
                        }}
                      />
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

async function updateFrontMatter(
  filePath: string,
  field: string,
  value: unknown,
) {
  try {
    const response = await fetch("/api/update-frontmatter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filePath,
        field,
        value,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to update frontmatter")
    }
  } catch (error) {
    console.error("Error updating frontmatter:", error)
    // TODO: エラーハンドリングを改善
  }
}

async function createIndexFile(
  filePath: string,
  title?: string,
  description?: string,
) {
  try {
    const frontMatter: Record<string, unknown> = {}
    if (title) frontMatter.title = title
    if (description) frontMatter.description = description

    const response = await fetch("/api/create-index-file", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filePath,
        frontMatter,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create index file")
    }

    // 作成後はページをリロード
    window.location.reload()
  } catch (error) {
    console.error("Error creating index file:", error)
  }
}
