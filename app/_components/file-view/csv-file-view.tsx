"use client"

import { FileCsvColumns } from "@/app/_components/file-view/file-csv-columns-view"
import { FileCsvTable } from "@/app/_components/file-view/file-csv-table"
import { FileHeader } from "@/app/_components/file-view/file-header"
import { Button } from "@/app/_components/ui/button"
import { useState } from "react"

export type Props = {
  filePath: string
  fileData: {
    path: string
    title: string | null
  }
  cwd: string
  content: string
  onChange(content: string): void
  onReload: () => void
  isLoading: boolean
}

export function CsvFileView(props: Props) {
  const [isColumnEditMode, setIsColumnEditMode] = useState(false)

  const toggleColumnEditMode = () => {
    setIsColumnEditMode(!isColumnEditMode)
  }

  return (
    <div className="space-y-2">
      <FileHeader
        filePath={props.filePath}
        fileData={props.fileData}
        cwd={props.cwd}
        onReload={props.onReload}
        isLoading={props.isLoading}
      >
        <Button
          onClick={toggleColumnEditMode}
          variant={isColumnEditMode ? "default" : "secondary"}
        >
          {"カラム"}
        </Button>
      </FileHeader>
      {isColumnEditMode ? (
        <FileCsvColumns content={props.content} onChange={props.onChange} />
      ) : (
        <FileCsvTable content={props.content} onChange={props.onChange} />
      )}
    </div>
  )
}
