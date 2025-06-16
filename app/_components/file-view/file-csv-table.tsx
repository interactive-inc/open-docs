"use client"

import { Card } from "@/app/_components/ui/card"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table"
import { OpenCsv } from "@/lib/open-csv/open-csv"
import type { DragEndEvent } from "@dnd-kit/core"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useState } from "react"
import { SortableCsvRow } from "./sortable-csv-row"

type Props = {
  content: string
  onChange(content: string): void
}

export function FileCsvTable(props: Props) {
  const [csvData, setCsvData] = useState(new OpenCsv(props.content))

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  )

  function handleDragEnd(event: DragEndEvent) {
    const active = event.active
    const over = event.over

    if (over && active.id !== over.id) {
      const activeId = String(active.id)
      const overId = String(over.id)

      const activeSplit = activeId.split("-")
      const overSplit = overId.split("-")

      if (activeSplit.length < 2 || overSplit.length < 2) {
        return
      }

      const activeIndex = activeSplit[1]
      const overIndex = overSplit[1]

      if (activeIndex === undefined || overIndex === undefined) {
        return
      }

      const activeRowIndex = Number.parseInt(activeIndex, 10) + 1 // +1 for header row
      const overRowIndex = Number.parseInt(overIndex, 10) + 1

      const newRecords = arrayMove(
        csvData.records,
        activeRowIndex - 1,
        overRowIndex - 1,
      )

      // Create a new CSV string to initialize a new OpenCsv instance
      const headers = csvData.headers
      if (headers.length > 0) {
        const newData = [headers, ...newRecords.map((row) => [...row])]
        const newCsvString = newData.map((row) => row.join(",")).join("\n")
        setCsvData(new OpenCsv(newCsvString))

        // 親コンポーネントに変更を通知
        props.onChange(newCsvString)
      }
    }
  } // Create unique and stable ids for each row
  const rowIds = csvData.records.map((_, idx) => `row-${idx}`)

  function handleCellUpdate(
    rowIndex: number,
    columnIndex: number,
    value: string,
  ) {
    const newCsvData = csvData.updateCell(rowIndex + 1, columnIndex, value) // +1 for header row
    const newCsvString = newCsvData.toString()
    setCsvData(newCsvData)
    props.onChange(newCsvString)
  }

  return (
    <Card className="h-full max-h-fit max-w-none overflow-hidden rounded-md p-0">
      <Table className="w-full border-collapse">
        <TableHeader>
          <TableRow>
            <TableHead />
            {csvData.headers.map((header: string, index: number) => {
              const headerKey = `header-${index}-${header}`
              return <TableHead key={headerKey}>{header}</TableHead>
            })}
          </TableRow>
        </TableHeader>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <TableBody>
            <SortableContext
              items={rowIds}
              strategy={verticalListSortingStrategy}
            >
              {csvData.records.map((row: string[], rowIndex: number) => {
                const rowId = `row-${rowIndex}`
                return (
                  <SortableCsvRow
                    key={rowId}
                    id={rowId}
                    row={row}
                    rowIndex={rowIndex}
                    onCellUpdate={handleCellUpdate}
                  />
                )
              })}
            </SortableContext>
          </TableBody>
        </DndContext>
      </Table>
    </Card>
  )
}
