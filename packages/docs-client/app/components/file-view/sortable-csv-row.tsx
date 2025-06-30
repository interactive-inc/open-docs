import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { TableCell, TableRow } from "@/components/ui/table"
import { EditableCsvCell } from "./editable-csv-cell"

type Props = {
  id: string
  row: string[]
  rowIndex: number
  onCellUpdate: (rowIndex: number, columnIndex: number, value: string) => void
}

export function SortableCsvRow(props: Props) {
  const sortable = useSortable({
    id: props.id,
    attributes: {
      role: "button",
      tabIndex: 0,
    },
  })

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    opacity: sortable.isDragging ? 0.5 : 1,
    touchAction: "none",
  }

  function handleCellChange(
    rowIndex: number,
    columnIndex: number,
    value: string,
  ) {
    props.onCellUpdate(rowIndex, columnIndex, value)
  }

  return (
    <TableRow
      ref={sortable.setNodeRef}
      style={style}
      className="hover:opacity-60"
    >
      <TableCell {...sortable.attributes} {...sortable.listeners}>
        <GripVertical className="size-4" />
      </TableCell>
      {props.row.map((cell: string, cellIndex: number) => (
        <EditableCsvCell
          key={`cell-${props.rowIndex}-${cellIndex}-${cell}`}
          content={cell}
          rowIndex={props.rowIndex}
          columnIndex={cellIndex}
          onCellChange={handleCellChange}
        />
      ))}
    </TableRow>
  )
}
