"use client"
import { Input } from "@/app/_components/ui/input"
import { useState } from "react"

type Props = {
  value: unknown
  onUpdate: (value: unknown) => void
}

export function ArrayNumberEditableCell(props: Props) {
  const [editValue, setEditValue] = useState("")

  const formatValue = (value: unknown): string => {
    if (value === undefined || value === null) {
      return ""
    }
    return Array.isArray(value) ? value.join(", ") : ""
  }

  const parseValue = (text: string): unknown => {
    if (text === "") {
      return undefined
    }
    return text.split(",").map((s) => {
      const n = Number(s.trim())
      return Number.isNaN(n) ? 0 : n
    })
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