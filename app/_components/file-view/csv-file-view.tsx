"use client"

import { FileCsvColumns } from "@/app/_components/file-view/file-csv-columns-view"
import { FileCsvTable } from "@/app/_components/file-view/file-csv-table"
import { PageHeader } from "@/app/_components/page-header"
import { Button } from "@/app/_components/ui/button"
import { useState } from "react"

export type Props = {
  fileName: string
  content: string
  onChange(content: string): void
}

export function CsvFileView(props: Props) {
  const [isColumnEditMode, setIsColumnEditMode] = useState(false)

  const toggleColumnEditMode = () => {
    setIsColumnEditMode(!isColumnEditMode)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <PageHeader filePath={props.fileName} />
        <Button
          onClick={toggleColumnEditMode}
          variant={isColumnEditMode ? "default" : "secondary"}
        >
          {"カラム"}
        </Button>
      </div>
      {isColumnEditMode ? (
        <FileCsvColumns content={props.content} onChange={props.onChange} />
      ) : (
        <FileCsvTable content={props.content} onChange={props.onChange} />
      )}
    </div>
  )
}
