"use client"
import { DirectoryTableView } from "@/app/_components/directory-table-view"
import { SidebarButton } from "@/app/_components/sidebar-button"
import { Input } from "@/app/_components/ui/input"
import { Textarea } from "@/app/_components/ui/textarea"
import { VscodeButton } from "@/app/_components/vscode-button"
import type { FileNode } from "@/lib/get-docs-files"
import { useUpdateProperties } from "@/lib/hooks/use-update-properties"
import type { SchemaDefinition } from "@/lib/types/schema-types"
import { useMemo, useState } from "react"

type Props = {
  files: FileNode[]
  currentPath: string
  schema?: SchemaDefinition | null
  title?: string | null
  description?: string | null
  indexPath?: string
  fileContents?: Array<{
    path: string
    frontMatter: Record<string, unknown>
    content: string
  }>
}

export function DirectoryContentView(props: Props) {
  const [title, setTitle] = useState(props.title || "")

  const [description, setDescription] = useState(props.description || "")

  const updateProperties = useUpdateProperties()

  const markdownFiles = useMemo(() => {
    let currentLevel = props.files

    if (props.currentPath && props.currentPath !== "") {
      const parts = props.currentPath.split("/").filter(Boolean)

      for (const part of parts) {
        const directory = currentLevel.find(
          (item) => item.type === "directory" && item.name === part,
        )

        if (!directory || !directory.children) {
          return []
        }

        currentLevel = directory.children
      }
    }

    return currentLevel
      .filter(
        (item) =>
          item.type === "file" &&
          item.name.endsWith(".md") &&
          item.name !== "README.md" &&
          item.name !== "index.md",
      )
      .map((file) => file.path)
  }, [props.files, props.currentPath])

  const handleTitleChange = async (newTitle: string) => {
    setTitle(newTitle)
    if (props.indexPath) {
      await updateProperties.mutateAsync({
        path: props.indexPath,
        field: "title",
        value: newTitle || undefined,
      })
    }
  }

  const handleDescriptionChange = async (newDescription: string) => {
    setDescription(newDescription)
    if (props.indexPath) {
      await updateProperties.mutateAsync({
        path: props.indexPath,
        field: "description",
        value: newDescription || undefined,
      })
    }
  }

  const handleCellUpdate = async (
    path: string,
    field: string,
    value: unknown,
  ) => {
    await updateProperties.mutateAsync({ path, field, value })
  }

  // パスからディレクトリ名を取得
  const getDirectoryName = () => {
    const parts = props.currentPath.split("/").filter(Boolean)
    return parts[parts.length - 1] || "Root"
  }

  if (markdownFiles.length === 0) {
    return (
      <div className="p-4">
        <h1 className="mb-4 font-bold text-xl">{`${props.currentPath || "/"}`}</h1>
        <div className="text-center text-gray-500">
          このディレクトリにはMarkdownファイルがありません
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 p-4">
      <div className="flex items-center gap-2">
        <SidebarButton />
        {props.indexPath && (
          <VscodeButton
            cwd="/Users/n/Documents/open-docs"
            filePath={props.indexPath}
            size="icon"
            variant="outline"
          />
        )}
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={(e) => handleTitleChange(e.target.value)}
          placeholder={getDirectoryName()}
          className="flex-1"
        />
      </div>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={(e) => handleDescriptionChange(e.target.value)}
        placeholder="説明を入力"
        rows={2}
      />
      <DirectoryTableView
        files={markdownFiles}
        schema={props.schema}
        onUpdate={handleCellUpdate}
        fileContents={props.fileContents}
      />
    </div>
  )
}
