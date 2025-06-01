"use client"
import { useState } from "react"

type Props = {
  value: any
  type: string
  onUpdate: (value: any) => void
}

export function EditableTableCell(props: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")

  const formatValue = (value: any, type: string): string => {
    if (value === undefined || value === null) {
      return ""
    }

    switch (type) {
      case "boolean":
        return value ? "true" : "false"
      case "array-string":
      case "array-number":
      case "array-boolean":
        return Array.isArray(value) ? value.join(", ") : ""
      default:
        return String(value)
    }
  }

  const parseValue = (text: string, type: string): any => {
    if (text === "") {
      return undefined
    }

    switch (type) {
      case "number": {
        const num = Number(text)
        return Number.isNaN(num) ? undefined : num
      }
      case "boolean":
        return text.toLowerCase() === "true"
      case "array-string":
        return text
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      case "array-number":
        return text.split(",").map((s) => {
          const n = Number(s.trim())
          return Number.isNaN(n) ? 0 : n
        })
      case "array-boolean":
        return text.split(",").map((s) => s.trim().toLowerCase() === "true")
      default:
        return text
    }
  }

  const displayValue = formatValue(props.value, props.type)

  const handleClick = () => {
    setIsEditing(true)
    setEditValue(displayValue)
  }

  const handleBlur = () => {
    setIsEditing(false)
    const parsedValue = parseValue(editValue, props.type)
    if (parsedValue !== props.value) {
      props.onUpdate(parsedValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur()
    }
    if (e.key === "Escape") {
      setIsEditing(false)
      setEditValue(displayValue)
    }
  }

  return (
    <div className="relative">
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 w-full bg-transparent px-3 py-2 outline-none"
        />
      ) : null}
      <div
        onClick={handleClick}
        className={`cursor-pointer px-3 py-2 hover:bg-muted/50 ${
          isEditing ? "invisible" : ""
        }`}
      >
        {displayValue || <span className="text-muted-foreground">-</span>}
      </div>
    </div>
  )
}
