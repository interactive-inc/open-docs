import { Button } from "@/app/_components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select"
import { X } from "lucide-react"

type RelationOption = {
  value: string
  label: string
  path: string
}

type Props = {
  value: string[]
  onValueChange: (value: string[]) => void
  relationOptions?: RelationOption[]
  wrap?: boolean
}

/**
 * 配列リレーション用のSelectコンポーネント
 */
export function ArrayRelationSelect(props: Props) {
  const options = props.relationOptions || []
  const selectedValues = Array.isArray(props.value) ? props.value : []

  // 選択済みの値を除外した利用可能なオプション
  const availableOptions = options.filter(
    (option) => !selectedValues.includes(option.value),
  )

  const addValue = (newValue: string) => {
    if (newValue && !selectedValues.includes(newValue)) {
      const updatedValues = [...selectedValues, newValue]
      props.onValueChange(updatedValues)
    }
  }

  const removeValue = (valueToRemove: string) => {
    const updatedValues = selectedValues.filter((val) => val !== valueToRemove)
    props.onValueChange(updatedValues)
  }

  // wrapありの場合（ファイル詳細用）
  if (props.wrap) {
    return (
      <div className="space-y-2">
        {/* 新しい値を追加するSelect */}
        {availableOptions.length > 0 && (
          <Select onValueChange={addValue}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="項目を追加" />
            </SelectTrigger>
            <SelectContent>
              {availableOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {/* 選択済みの値を表示（wrap対応） */}
        <div className="flex flex-wrap gap-2">
          {selectedValues.toReversed().map((value) => {
            const option = options.find((opt) => opt.value === value)
            const label = option?.label || value
            return (
              <Button
                key={value}
                variant={"outline"}
                onClick={() => removeValue(value)}
                className="h-auto break-words text-left"
              >
                <span className="flex-1">{label}</span>
                <X className="ml-2 w-4 flex-shrink-0 text-muted-foreground" />
              </Button>
            )
          })}
        </div>
        {selectedValues.length === 0 && availableOptions.length === 0 && (
          <div className="text-muted-foreground text-sm">
            利用可能なオプションがありません
          </div>
        )}
      </div>
    )
  }

  // wrapなしの場合（テーブル用）
  return (
    <div className="flex gap-2">
      {/* 新しい値を追加するSelect */}
      {availableOptions.length > 0 && (
        <Select onValueChange={addValue}>
          <SelectTrigger className="min-w-24">
            <SelectValue placeholder="項目を追加" />
          </SelectTrigger>
          <SelectContent>
            {availableOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {/* 選択済みの値を表示（横並び） */}
      {selectedValues.toReversed().map((value) => {
        const option = options.find((opt) => opt.value === value)
        const label = option?.label || value
        return (
          <Button
            key={value}
            variant={"outline"}
            onClick={() => removeValue(value)}
          >
            <span>{label}</span>
            <X className="w-4 text-muted-foreground" />
          </Button>
        )
      })}
      {selectedValues.length === 0 && availableOptions.length === 0 && (
        <div className="text-muted-foreground text-sm">
          利用可能なオプションがありません
        </div>
      )}
    </div>
  )
}
