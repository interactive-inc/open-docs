import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  value: number
  options: number[]
  onValueChange: (value: number) => void
}

/**
 * 数値選択セル
 */
export function SelectNumberEditableCell(props: Props) {
  const handleValueChange = (value: string) => {
    const numValue = Number.parseInt(value, 10)
    if (!Number.isNaN(numValue)) {
      props.onValueChange(numValue)
    }
  }

  return (
    <Select
      value={props.value?.toString() || ""}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className="w-full bg-background">
        <SelectValue placeholder="選択してください" />
      </SelectTrigger>
      <SelectContent>
        {props.options.map((option) => (
          <SelectItem key={option} value={option.toString()}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
