"use client"
import { MultiRelationSelect } from "@/app/_components/file-view/multi-relation-select"
import type { RelationOption } from "@/lib/types"

type Props = {
  value: unknown
  onUpdate: (value: unknown) => void
  relationOptions?: RelationOption[]
}

export function MultiRelationEditableCell(props: Props) {
  return (
    <MultiRelationSelect
      value={Array.isArray(props.value) ? props.value : []}
      relationOptions={props.relationOptions}
      onValueChange={(value) => props.onUpdate(value)}
    />
  )
}
