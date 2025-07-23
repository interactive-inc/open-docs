import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type Props = {
  id: string
  children: React.ReactNode
}

export function CsvSortableHeader({ id, children }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <th
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab border border-gray-600 p-2 text-sm"
    >
      {children}
    </th>
  )
}
