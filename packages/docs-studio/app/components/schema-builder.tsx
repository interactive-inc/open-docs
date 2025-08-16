import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { DocFileIndexSchemaField } from "@/lib/types"

type Props = {
  schema: Record<string, unknown> | null
  onSchemaChange: (schema: Record<string, unknown>) => void
}

type FieldType =
  | "text"
  | "number"
  | "boolean"
  | "multi-text"
  | "multi-number"
  | "relation"
  | "multi-relation"
  | "select-text"
  | "select-number"
  | "multi-select-text"
  | "multi-select-number"

export function SchemaBuilder(props: Props) {
  const [fields, setFields] = useState<
    Array<{
      key: string
      type: FieldType
      required: boolean
      options?: string[]
      min?: number
      max?: number
      relationTo?: string
    }>
  >(() => {
    if (!props.schema) return []

    return Object.entries(props.schema).map(([key, value]) => {
      const field = value as DocFileIndexSchemaField
      return {
        key,
        type: field.type as FieldType,
        required: field.required ?? false,
        options: (field as any).options,
        min: (field as any).min,
        max: (field as any).max,
        relationTo: (field as any).relationTo,
      }
    })
  })

  const [newFieldKey, setNewFieldKey] = useState("")
  const [newFieldType, setNewFieldType] = useState<FieldType>("text")

  const addField = () => {
    if (!newFieldKey) return

    const newField = {
      key: newFieldKey,
      type: newFieldType,
      required: false,
    }

    const updatedFields = [...fields, newField]
    setFields(updatedFields)
    updateSchema(updatedFields)

    setNewFieldKey("")
    setNewFieldType("text")
  }

  const removeField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index)
    setFields(updatedFields)
    updateSchema(updatedFields)
  }

  const updateField = (index: number, updates: Partial<(typeof fields)[0]>) => {
    const updatedFields = [...fields]
    updatedFields[index] = { ...updatedFields[index], ...updates }
    setFields(updatedFields)
    updateSchema(updatedFields)
  }

  const updateSchema = (updatedFields: typeof fields) => {
    const schema: Record<string, unknown> = {}

    for (const field of updatedFields) {
      const schemaField: Record<string, unknown> = {
        type: field.type,
        required: field.required,
      }

      if (field.options && field.options.length > 0) {
        schemaField.options = field.options
      }

      if (field.min !== undefined) {
        schemaField.min = field.min
      }

      if (field.max !== undefined) {
        schemaField.max = field.max
      }

      if (field.relationTo) {
        schemaField.relationTo = field.relationTo
      }

      schema[field.key] = schemaField
    }

    props.onSchemaChange(schema)
  }

  const fieldTypeOptions = [
    { value: "text", label: "テキスト" },
    { value: "number", label: "数値" },
    { value: "boolean", label: "真偽値" },
    { value: "multi-text", label: "複数テキスト" },
    { value: "multi-number", label: "複数数値" },
    { value: "relation", label: "リレーション" },
    { value: "multi-relation", label: "複数リレーション" },
    { value: "select-text", label: "選択テキスト" },
    { value: "select-number", label: "選択数値" },
    { value: "multi-select-text", label: "複数選択テキスト" },
    { value: "multi-select-number", label: "複数選択数値" },
  ]

  return (
    <Card className="gap-x-0 gap-y-2 p-2">
      <p>スキーマ</p>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={`${field.key}-${index}`}
            className="space-y-2 rounded-md border p-3"
          >
            <div className="flex items-center gap-x-2">
              <Input
                value={field.key}
                onChange={(e) => updateField(index, { key: e.target.value })}
                placeholder="フィールド名"
                className="flex-1"
              />
              <select
                value={field.type}
                onChange={(e) =>
                  updateField(index, { type: e.target.value as FieldType })
                }
                className="rounded-md border px-3 py-2"
              >
                {fieldTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) =>
                    updateField(index, { required: e.target.checked })
                  }
                />
                必須
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeField(index)}
              >
                削除
              </Button>
            </div>

            {field.type === "relation" || field.type === "multi-relation" ? (
              <Input
                value={field.relationTo || ""}
                onChange={(e) =>
                  updateField(index, { relationTo: e.target.value })
                }
                placeholder="リレーション先 (例: docs/projects/**/*.md)"
                className="text-sm"
              />
            ) : null}

            {field.type.includes("select") ? (
              <Input
                value={field.options?.join(", ") || ""}
                onChange={(e) =>
                  updateField(index, {
                    options: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="選択肢 (カンマ区切り)"
                className="text-sm"
              />
            ) : null}

            {field.type === "number" ||
            field.type === "multi-number" ||
            field.type === "select-number" ||
            field.type === "multi-select-number" ? (
              <div className="flex gap-x-2">
                <Input
                  type="number"
                  value={field.min ?? ""}
                  onChange={(e) =>
                    updateField(index, {
                      min: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="最小値"
                  className="text-sm"
                />
                <Input
                  type="number"
                  value={field.max ?? ""}
                  onChange={(e) =>
                    updateField(index, {
                      max: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="最大値"
                  className="text-sm"
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex gap-x-2">
        <Input
          value={newFieldKey}
          onChange={(e) => setNewFieldKey(e.target.value)}
          placeholder="新しいフィールド名"
          className="flex-1"
        />
        <select
          value={newFieldType}
          onChange={(e) => setNewFieldType(e.target.value as FieldType)}
          className="rounded-md border px-3 py-2"
        >
          {fieldTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button onClick={addField}>追加</Button>
      </div>
    </Card>
  )
}
