"use client"
import { SingleRelationSelect } from "@/app/_components/file-view/single-relation-select"
import type { RelationOption } from "@/lib/types"

type Props = {
  value: unknown
  onUpdate: (value: unknown) => void
  relationOptions?: RelationOption[]
}

export function RelationEditableCell(props: Props) {
  return (
    <SingleRelationSelect
      value={(props.value as string) || ""}
      relationOptions={props.relationOptions}
      onValueChange={(value) => props.onUpdate(value)}
    />
  )
}
