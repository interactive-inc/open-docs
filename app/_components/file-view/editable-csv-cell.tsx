"use client"

import { TableCell } from "@/app/_components/ui/table"
import { useRef, useState } from "react"

type Props = {
  content: string
  rowIndex: number
  columnIndex: number
  onCellChange: (rowIndex: number, columnIndex: number, value: string) => void
}

export function EditableCsvCell(props: Props) {
  const [value, setValue] = useState(props.content)
  const cellRef = useRef<HTMLTableCellElement>(null)

  function handleBlur() {
    if (value !== props.content) {
      props.onCellChange(props.rowIndex, props.columnIndex, value)
    }
  }

  function handleInput(event: React.FormEvent<HTMLTableCellElement>) {
    const newValue = event.currentTarget.textContent || ""
    setValue(newValue)
  }

  return (
    <TableCell
      ref={cellRef}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onInput={handleInput}
    >
      {props.content}
    </TableCell>
  )
}
