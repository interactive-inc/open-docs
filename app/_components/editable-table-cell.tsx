"use client"
import type { RelationOption } from "@/lib/types"
import { ArrayBooleanEditableCell } from "./editable-table-cell/array-boolean-editable-cell"
import { ArrayNumberEditableCell } from "./editable-table-cell/array-number-editable-cell"
import { ArrayRelationEditableCell } from "./editable-table-cell/array-relation-editable-cell"
import { ArrayStringEditableCell } from "./editable-table-cell/array-string-editable-cell"
import { BooleanEditableCell } from "./editable-table-cell/boolean-editable-cell"
import { NumberEditableCell } from "./editable-table-cell/number-editable-cell"
import { RelationEditableCell } from "./editable-table-cell/relation-editable-cell"
import { StringEditableCell } from "./editable-table-cell/string-editable-cell"

type Props = {
  value: unknown
  type: string
  onUpdate: (value: unknown) => void
  relationPath?: string | null
  relationOptions?: RelationOption[]
}

export function EditableTableCell(props: Props) {
  // Boolean型の場合
  if (props.type === "boolean") {
    return <BooleanEditableCell value={props.value} onUpdate={props.onUpdate} />
  }

  // 数値型の場合
  if (props.type === "number") {
    return (
      <NumberEditableCell
        value={props.value as number}
        onUpdate={props.onUpdate}
      />
    )
  }

  // 単一リレーション型の場合
  if (props.type === "relation" && props.relationPath) {
    return (
      <RelationEditableCell
        value={props.value}
        onUpdate={props.onUpdate}
        relationOptions={props.relationOptions}
      />
    )
  }

  // 配列リレーション型の場合
  if (props.type === "array-relation" && props.relationPath) {
    return (
      <ArrayRelationEditableCell
        value={props.value}
        onUpdate={props.onUpdate}
        relationOptions={props.relationOptions}
      />
    )
  }

  // 配列文字列型の場合
  if (props.type === "array-string") {
    return <ArrayStringEditableCell value={props.value} onUpdate={props.onUpdate} />
  }

  // 配列数値型の場合
  if (props.type === "array-number") {
    return <ArrayNumberEditableCell value={props.value} onUpdate={props.onUpdate} />
  }

  // 配列Boolean型の場合
  if (props.type === "array-boolean") {
    return <ArrayBooleanEditableCell value={props.value} onUpdate={props.onUpdate} />
  }

  // その他（文字列型）の場合
  return <StringEditableCell value={props.value} onUpdate={props.onUpdate} />
}
