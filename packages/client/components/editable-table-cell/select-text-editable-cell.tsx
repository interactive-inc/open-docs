import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  value: string
  options: string[]
  onValueChange: (value: string) => void
}

/**
 * テキスト選択セル
 */
export function SelectTextEditableCell(props: Props) {
  return (
    <Select value={props.value || ""} onValueChange={props.onValueChange}>
      <SelectTrigger className="w-full bg-background">
        <SelectValue placeholder="選択してください" />
      </SelectTrigger>
      <SelectContent>
        {props.options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
