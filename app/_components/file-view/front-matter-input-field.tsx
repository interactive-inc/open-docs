import { Input } from "@/app/_components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select"
import type { RelationOption, SchemaField } from "@/lib/types"
import { useEffect, useState } from "react"
import { ArrayRelationSelect } from "./array-relation-select"
import { SingleRelationSelect } from "./single-relation-select"

type Props = {
  fieldKey: string
  value: unknown
  originalValue: unknown
  onValueChange: (key: string, value: string) => void
  onBlur: (key: string, value: string) => void
  schemaField?: SchemaField
  relationOptions?: RelationOption[]
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

  // リレーション型の場合
  if (
    props.schemaField &&
    props.schemaField.type === "relation" &&
    props.schemaField.relationPath
  ) {
    return (
      <SingleRelationSelect
        value={(props.value as string) || ""}
        relationOptions={props.relationOptions}
        onValueChange={(value) => props.onValueChange(props.fieldKey, value)}
      />
    )
  }

  // 配列リレーション型の場合
  if (
    props.schemaField &&
    props.schemaField.type === "array-relation" &&
    props.schemaField.relationPath
  ) {
    // 値を配列に正規化
    let normalizedValue: string[] = []
    if (Array.isArray(props.value)) {
      normalizedValue = props.value.filter(
        (v) => typeof v === "string" && v.trim() !== "",
      )
    } else if (typeof props.value === "string" && props.value.trim() !== "") {
      normalizedValue = props.value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v !== "")
    }

    return (
      <ArrayRelationSelect
        value={normalizedValue}
        relationOptions={props.relationOptions}
        onValueChange={(value) =>
          props.onValueChange(props.fieldKey, value.join(", "))
        }
        wrap={true}
      />
    )
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
