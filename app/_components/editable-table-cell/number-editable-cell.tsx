"use client"
import { Input } from "@/app/_components/ui/input"
import { useEffect, useState } from "react"

type Props = {
  value: number | null
  onUpdate: (value: number | null) => void
}

export function NumberEditableCell(props: Props) {
  const [isEditing, setIsEditing] = useState(false)

  const displayValue =
    props.value !== undefined && props.value !== null ? String(props.value) : ""
  const [editValue, setEditValue] = useState(displayValue)

  useEffect(() => {
    setEditValue(displayValue)
  }, [displayValue])

  const handleClick = () => {
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
