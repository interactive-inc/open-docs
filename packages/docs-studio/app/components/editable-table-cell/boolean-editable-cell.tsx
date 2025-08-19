import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  value: unknown
  onUpdate: (value: unknown) => void
}

export function BooleanEditableCell(props: Props) {
  return (
    <Select
      value={
        props.value === true
          ? "true"
          : props.value === false
            ? "false"
            : "undefined"
      }
      onValueChange={(value) => {
        if (value === "true") {
          props.onUpdate(true)
        } else if (value === "false") {
          props.onUpdate(false)
        } else {
          props.onUpdate(undefined)
        }
      }}
    >
      <SelectTrigger className="w-20">
        <SelectValue placeholder="選択してください" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="undefined">-</SelectItem>
        <SelectItem value="true">true</SelectItem>
        <SelectItem value="false">false</SelectItem>
      </SelectContent>
    </Select>
  )
}
