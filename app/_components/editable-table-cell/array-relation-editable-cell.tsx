"use client"
import { ArrayRelationSelect } from "@/app/_components/file-view/array-relation-select"
import type { RelationOption } from "@/lib/types"

type Props = {
  value: unknown
  onUpdate: (value: unknown) => void
  relationOptions?: RelationOption[]
}

export function ArrayRelationEditableCell(props: Props) {
  return (
    <ArrayRelationSelect
      value={Array.isArray(props.value) ? props.value : []}
      relationOptions={props.relationOptions}
      onValueChange={(value) => props.onUpdate(value)}
    />
  )
}
