import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DocRelationFile } from "@/lib/types"

type Props = {
  value: string[]
  onValueChange: (value: string[]) => void
  relationOptions?: DocRelationFile[]
  wrap?: boolean
}

/**
 * 複数リレーション用のSelectコンポーネント
 */
export function MultiRelationSelect(props: Props) {
  const options = props.relationOptions || []
  const selectedValues = Array.isArray(props.value) ? props.value : []

  // 選択済みの値を除外した利用可能なオプション
  const availableOptions = options.filter(
    (option) => !selectedValues.includes(option.name),
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
      <div className="items-center space-y-2">
        {/* 新しい値を追加するSelect */}
        {availableOptions.length > 0 && (
          <Select onValueChange={addValue}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="項目を追加" />
            </SelectTrigger>
            <SelectContent>
              {availableOptions.map((option) => (
                <SelectItem key={option.name} value={option.name}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {/* 選択済みの値を表示（wrap対応） */}
        <div className="flex flex-wrap gap-2">
          {selectedValues.toReversed().map((value) => {
            const option = options.find((opt) => opt.name === value)
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
        {/* オプションが定義されていない場合のメッセージ */}
        {options.length === 0 && (
          <div className="text-muted-foreground text-sm">
            リレーションが設定されていません
          </div>
        )}
      </div>
    )
  }

  // wrapなしの場合（テーブル用）
  return (
    <div className="flex items-center gap-2">
      {/* 新しい値を追加するSelect */}
      {availableOptions.length > 0 && (
        <Select onValueChange={addValue}>
          <SelectTrigger className="min-w-24">
            <SelectValue placeholder="項目を追加" />
          </SelectTrigger>
          <SelectContent>
            {availableOptions.map((option) => (
              <SelectItem key={option.name} value={option.name}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {/* 選択済みの値を表示（横並び） */}
      {selectedValues.toReversed().map((value) => {
        const option = options.find((opt) => opt.name === value)
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
      {/* オプションが定義されていない場合のメッセージ */}
      {options.length === 0 && (
        <div className="text-muted-foreground text-sm">
          リレーションが設定されていません
        </div>
      )}
    </div>
  )
}
