import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select"

type RelationOption = {
  value: string
  label: string
  path: string
}

type Props = {
  value: string
  onValueChange: (value: string) => void
  relationOptions?: RelationOption[]
}

/**
 * 単一リレーション用のSelectコンポーネント
 */
export function SingleRelationSelect(props: Props) {
  const options = props.relationOptions || []

  return (
    <Select value={props.value || ""} onValueChange={props.onValueChange}>
      <SelectTrigger className="w-full bg-background">
        <SelectValue placeholder="リレーションを選択" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
