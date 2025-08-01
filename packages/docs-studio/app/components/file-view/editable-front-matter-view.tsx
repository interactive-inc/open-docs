import { Card } from "@/components/ui/card"
import type {
  DocFileIndexSchema,
  DocFileMdMeta,
  DocRelation,
  RecordKey,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { FrontMatterInputField } from "./front-matter-input-field"

type Props = {
  meta: DocFileMdMeta<RecordKey> | null
  onUpdate?: (key: string, value: unknown) => void
  schema?: DocFileIndexSchema<string>
  relations?: DocRelation[]
}

/**
 * Front-matterを編集可能に表示するコンポーネント
 */
export function EditableFrontMatterView(props: Props) {
  const frontMatter = props.meta
  // front-matterが空の場合は表示しない
  if (!frontMatter || Object.keys(frontMatter).length === 0) {
    return null
  }

  const handleValueChange = (key: string, newValue: string) => {
    if (!props.onUpdate) {
      console.warn("onUpdate is not provided to EditableFrontMatterView")
      return
    }

    const originalValue = frontMatter[key]

    // 元の型に応じて値を変換
    let convertedValue: unknown = newValue

    if (typeof originalValue === "boolean") {
      convertedValue = newValue === "true"
    } else if (typeof originalValue === "number") {
      const numValue = Number(newValue)
      convertedValue = Number.isNaN(numValue) ? originalValue : numValue
    } else if (Array.isArray(originalValue)) {
      // 配列の場合はカンマ区切りで分割
      const items = newValue
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v !== "")
      if (originalValue.length > 0 && typeof originalValue[0] === "number") {
        convertedValue = items
          .map((v) => Number(v))
          .filter((v) => !Number.isNaN(v))
      } else if (
        originalValue.length > 0 &&
        typeof originalValue[0] === "boolean"
      ) {
        convertedValue = items.map((v) => v === "true")
      } else {
        convertedValue = items
      }
    } else if (originalValue === null && Array.isArray(newValue)) {
      // null値だが新しい値が配列の場合（配列リレーションなど）
      convertedValue = newValue
    }

    props.onUpdate(key, convertedValue)
  }

  const handleBlur = (key: string, value: string) => {
    handleValueChange(key, value)
  }

  return (
    <Card className="gap-4 rounded-md p-2">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {Object.entries(frontMatter).map(([key, value]) => {
          const schemaField = props.schema?.[key]
          const relationData = props.relations?.find((rel) => {
            return (
              rel.path ===
              (schemaField && "path" in schemaField ? schemaField.path : null)
            )
          })

          // multi-系のフィールドは2カラムスペースを使用
          const isMultiField = schemaField?.type?.startsWith("multi-")
          const columnSpan = isMultiField ? "md:col-span-2" : ""

          return (
            <div key={key} className={cn("flex flex-col gap-1", columnSpan)}>
              <span className="font-medium text-sm">{key}</span>
              <div className="flex-1">
                <FrontMatterInputField
                  fieldKey={key}
                  value={value}
                  originalValue={frontMatter[key]}
                  onValueChange={handleValueChange}
                  onBlur={handleBlur}
                  schemaField={schemaField}
                  relationOptions={relationData?.files}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
