import { Input } from "@/app/_components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select"
import { useEffect, useState } from "react"

type Props = {
  fieldKey: string
  value: unknown
  originalValue: unknown
  onValueChange: (key: string, value: string) => void
  onBlur: (key: string, value: string) => void
}

/**
 * Front Matter用の入力フィールドを表示するコンポーネント
 */
export function FrontMatterInputField(props: Props) {
  const [localValue, setLocalValue] = useState(() => {
    if (Array.isArray(props.value)) {
      return props.value.join(", ")
    }
    return String(props.value)
  })

  useEffect(() => {
    if (Array.isArray(props.value)) {
      setLocalValue(props.value.join(", "))
    } else {
      setLocalValue(String(props.value))
    }
  }, [props.value])

  const getDisplayValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      return value.join(", ")
    }
    return String(value)
  }

  if (typeof props.originalValue === "boolean") {
    return (
      <Select
        value={String(props.value)}
        onValueChange={(value) => props.onValueChange(props.fieldKey, value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">true</SelectItem>
          <SelectItem value="false">false</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  if (typeof props.originalValue === "number") {
    return (
      <Input
        type="number"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={(e) => props.onBlur(props.fieldKey, e.target.value)}
        className="flex-1"
        placeholder={`${props.fieldKey}の値を入力`}
      />
    )
  }

  if (Array.isArray(props.originalValue)) {
    const placeholder =
      props.originalValue.length > 0 &&
      typeof props.originalValue[0] === "number"
        ? "カンマ区切りで数値を入力 (例: 1, 2, 3)"
        : props.originalValue.length > 0 &&
            typeof props.originalValue[0] === "boolean"
          ? "カンマ区切りでtrue/falseを入力 (例: true, false, true)"
          : "カンマ区切りで入力 (例: item1, item2, item3)"

    return (
      <Input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={(e) => props.onBlur(props.fieldKey, e.target.value)}
        className="flex-1"
        placeholder={placeholder}
      />
    )
  }

  // string型の場合
  return (
    <Input
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={(e) => props.onBlur(props.fieldKey, e.target.value)}
      className="flex-1"
      placeholder={`${props.fieldKey}の値を入力`}
    />
  )
}
