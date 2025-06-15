"use client"
import { Input } from "@/app/_components/ui/input"
import { useEffect, useState } from "react"

type Props = {
  value: unknown
  onUpdate: (value: unknown) => void
}

export function MultiTextEditableCell(props: Props) {
  const formatValue = (value: unknown): string => {
    if (value === undefined || value === null) {
      return ""
    }
    return Array.isArray(value) ? value.join(", ") : ""
  }

  const [editValue, setEditValue] = useState(formatValue(props.value))

  useEffect(() => {
    setEditValue(formatValue(props.value))
  }, [props.value])

  const parseValue = (text: string): unknown => {
    if (text === "") {
      return undefined
    }
    return text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  }

  const displayValue = formatValue(props.value)

  const handleBlur = () => {
    const parsedValue = parseValue(editValue)
    if (parsedValue !== props.value) {
      props.onUpdate(parsedValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur()
    }
    if (e.key === "Escape") {
      setEditValue(displayValue)
    }
  }

  return (
    <Input
      type="text"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={displayValue || "-"}
    />
  )
}
