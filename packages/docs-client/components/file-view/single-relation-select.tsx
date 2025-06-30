import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { DocRelationFile } from "@/lib/types"

type Props = {
  value: string
  onValueChange: (value: string) => void
  relationOptions?: DocRelationFile[]
}

/**
 * 単一リレーション用のSelectコンポーネント
 */
export function SingleRelationSelect(props: Props) {
  const options = props.relationOptions || []

  const handleValueChange = (value: string) => {
    props.onValueChange(value)
  }

  return (
    <Select value={props.value || ""} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full bg-background">
        <SelectValue placeholder="リレーションを選択" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.name} value={option.name}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
