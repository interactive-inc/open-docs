import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"

type Props = {
  value: unknown
  onUpdate: (value: unknown) => void
}

export function StringEditableCell(props: Props) {
  const displayValue = props.value ? String(props.value) : ""
  const [editValue, setEditValue] = useState(displayValue)

  useEffect(() => {
    setEditValue(displayValue)
  }, [displayValue])

  const handleBlur = () => {
    if (editValue !== props.value) {
      props.onUpdate(editValue || undefined)
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
      className="w-full min-w-max"
      type="text"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={displayValue || "-"}
    />
  )
}
