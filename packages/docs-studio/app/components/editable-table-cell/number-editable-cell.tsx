import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"

type Props = {
  value: number | null
  onUpdate: (value: number | null) => void
}

export function NumberEditableCell(props: Props) {
  const [_isEditing, setIsEditing] = useState(false)

  const displayValue =
    props.value !== undefined && props.value !== null ? String(props.value) : ""
  const [editValue, setEditValue] = useState(displayValue)

  useEffect(() => {
    setEditValue(displayValue)
  }, [displayValue])

  const _handleClick = () => {
    setIsEditing(true)
    setEditValue(props.value ? String(props.value) : "")
  }

  const handleBlur = () => {
    setIsEditing(false)
    const num = Number(editValue)
    const parsedValue =
      editValue === "" ? undefined : Number.isNaN(num) ? undefined : num
    if (parsedValue !== props.value) {
      props.onUpdate(parsedValue ?? null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur()
    }
    if (e.key === "Escape") {
      setIsEditing(false)
      setEditValue(props.value ? String(props.value) : "")
    }
  }

  return (
    <Input
      type="number"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  )
}
