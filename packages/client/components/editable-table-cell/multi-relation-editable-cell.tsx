import { MultiRelationSelect } from "@/components/file-view/multi-relation-select"
import type { DocRelationFile } from "@/lib/types"

type Props = {
  value: unknown
  onUpdate: (value: unknown) => void
  relationOptions?: DocRelationFile[]
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
