import type { DocRelationFile } from "@/lib/types"
import { BooleanEditableCell } from "./boolean-editable-cell"
import { MultiBooleanEditableCell } from "./multi-boolean-editable-cell"
import { MultiNumberEditableCell } from "./multi-number-editable-cell"
import { MultiRelationEditableCell } from "./multi-relation-editable-cell"
import { MultiSelectNumberEditableCell } from "./multi-select-number-editable-cell"
import { MultiSelectTextEditableCell } from "./multi-select-text-editable-cell"
import { MultiTextEditableCell } from "./multi-text-editable-cell"
import { NumberEditableCell } from "./number-editable-cell"
import { RelationEditableCell } from "./relation-editable-cell"
import { SelectNumberEditableCell } from "./select-number-editable-cell"
import { SelectTextEditableCell } from "./select-text-editable-cell"
import { StringEditableCell } from "./string-editable-cell"

type Props = {
  value: unknown
  type: string
  onUpdate: (value: unknown) => void
  path?: string | null
  relationOptions?: DocRelationFile[]
  selectOptions?: string[] | number[]
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
  if (props.type === "relation") {
    return (
      <RelationEditableCell
        value={props.value}
        onUpdate={props.onUpdate}
        relationOptions={props.relationOptions}
      />
    )
  }

  // 複数リレーション型の場合
  if (props.type === "multi-relation") {
    return (
      <MultiRelationEditableCell
        value={props.value}
        onUpdate={props.onUpdate}
        relationOptions={props.relationOptions}
      />
    )
  }

  // 複数テキスト型の場合
  if (props.type === "multi-text") {
    return (
      <MultiTextEditableCell value={props.value} onUpdate={props.onUpdate} />
    )
  }

  // 複数数値型の場合
  if (props.type === "multi-number") {
    return (
      <MultiNumberEditableCell value={props.value} onUpdate={props.onUpdate} />
    )
  }

  // 複数Boolean型の場合
  if (props.type === "multi-boolean") {
    return (
      <MultiBooleanEditableCell value={props.value} onUpdate={props.onUpdate} />
    )
  }

  // 選択テキスト型の場合
  if (props.type === "select-text" && props.selectOptions) {
    return (
      <SelectTextEditableCell
        value={props.value as string}
        options={props.selectOptions as string[]}
        onValueChange={props.onUpdate}
      />
    )
  }

  // 選択数値型の場合
  if (props.type === "select-number" && props.selectOptions) {
    return (
      <SelectNumberEditableCell
        value={props.value as number}
        options={props.selectOptions as number[]}
        onValueChange={props.onUpdate}
      />
    )
  }

  // 複数選択テキスト型の場合
  if (props.type === "multi-select-text" && props.selectOptions) {
    return (
      <MultiSelectTextEditableCell
        value={props.value as string[]}
        options={props.selectOptions as string[]}
        onUpdate={props.onUpdate}
      />
    )
  }

  // 複数選択数値型の場合
  if (props.type === "multi-select-number" && props.selectOptions) {
    return (
      <MultiSelectNumberEditableCell
        value={props.value as number[]}
        options={props.selectOptions as number[]}
        onUpdate={props.onUpdate}
      />
    )
  }

  // その他（文字列型）の場合
  return <StringEditableCell value={props.value} onUpdate={props.onUpdate} />
}
