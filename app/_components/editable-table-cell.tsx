"use client"
import { ArrayRelationSelect } from "@/app/_components/file-view/array-relation-select"
import { SingleRelationSelect } from "@/app/_components/file-view/single-relation-select"
import type { RelationOption } from "@/system/types"
import { useState } from "react"

type Props = {
  value: unknown
  type: string
  onUpdate: (value: unknown) => void
  relationPath?: string
  relationOptions?: RelationOption[]
}

export function EditableTableCell(props: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")

  const formatValue = (value: unknown, type: string): string => {
    if (value === undefined || value === null) {
      return ""
    }

    switch (type) {
      case "boolean":
        return value ? "true" : "false"
      case "array-string":
      case "array-number":
      case "array-boolean":
      case "array-relation":
        return Array.isArray(value) ? value.join(", ") : ""
      case "relation":
        return value ? String(value) : ""
      default:
        return String(value)
    }
  }

  const parseValue = (text: string, type: string): unknown => {
    if (text === "") {
      return undefined
    }

    if (type === "number") {
      const num = Number(text)
      return Number.isNaN(num) ? undefined : num
    }

    if (type === "boolean") {
      return text.toLowerCase() === "true"
    }

    if (type === "array-string") {
      return text
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    }

    if (type === "array-number") {
      return text.split(",").map((s) => {
        const n = Number(s.trim())
        return Number.isNaN(n) ? 0 : n
      })
    }

    if (type === "array-boolean") {
      return text.split(",").map((s) => s.trim().toLowerCase() === "true")
    }

    if (type === "relation") {
      return text || null
    }

    if (type === "array-relation") {
      return text
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    }

    return text
  }

  const displayValue = formatValue(props.value, props.type)

  // 単一リレーション型の場合
  if (props.type === "relation" && props.relationPath) {
    return (
      <div className="px-3 py-2">
        <SingleRelationSelect
          value={(props.value as string) || ""}
          relationOptions={props.relationOptions}
          onValueChange={(value) => props.onUpdate(value)}
        />
      </div>
    )
  }

  // 配列リレーション型の場合
  if (props.type === "array-relation" && props.relationPath) {
    return (
      <div className="px-3 py-2">
        <ArrayRelationSelect
          value={Array.isArray(props.value) ? props.value : []}
          relationOptions={props.relationOptions}
          onValueChange={(value) => props.onUpdate(value)}
        />
      </div>
    )
  }

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
      <button
        type="button"
        onClick={handleClick}
        className={`w-full cursor-pointer px-3 py-2 text-left hover:bg-muted/50 ${
          isEditing ? "invisible" : ""
        }`}
      >
        {displayValue || <span className="text-muted-foreground">-</span>}
      </button>
    </div>
  )
}
