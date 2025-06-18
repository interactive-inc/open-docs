import { X } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Props = {
  value: string[]
  options: string[]
  onUpdate: (value: string[]) => void
}

/**
 * 複数選択テキストセル
 */
export function MultiSelectTextEditableCell(props: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const currentValues = props.value || []

  const handleToggle = (option: string) => {
    const isSelected = currentValues.includes(option)
    const newValues = isSelected
      ? currentValues.filter((v) => v !== option)
      : [...currentValues, option]
    props.onUpdate(newValues)
  }

  const handleRemove = (value: string) => {
    const newValues = currentValues.filter((v) => v !== value)
    props.onUpdate(newValues)
  }

  return (
    <div className="relative">
      <div className="flex min-h-8 flex-wrap gap-1 rounded-md border p-2">
        {currentValues.map((value) => (
          <Badge
            key={value}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {value}
            <Button
              size="sm"
              variant="ghost"
              className="h-4 w-4 p-0"
              onClick={() => handleRemove(value)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-muted-foreground"
        >
          追加
        </Button>
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
          {props.options
            .filter((option) => !currentValues.includes(option))
            .map((option) => (
              <button
                type="button"
                key={option}
                className="w-full px-3 py-2 text-left hover:bg-gray-100"
                onClick={() => {
                  handleToggle(option)
                  setIsOpen(false)
                }}
              >
                {option}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
