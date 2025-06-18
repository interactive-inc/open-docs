import { ArrowDown, ArrowUp, Check, Plus, XCircle } from "lucide-react"
import { type FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { OpenCsv } from "@/lib/open-csv/open-csv"
import { cn } from "@/lib/utils"

type Props = {
  content: string
  onChange(content: string): void
}

export function FileCsvColumns(props: Props) {
  const [csvInstance, setCsvInstance] = useState<OpenCsv>(
    new OpenCsv(props.content),
  )

  const [editingHeader, setEditingHeader] = useState<{
    index: number
    value: string
  } | null>(null)

  const [newColumnName, setNewColumnName] = useState("")

  // propsの変更を検知してCSVインスタンスを更新
  useEffect(() => {
    setCsvInstance(new OpenCsv(props.content))
  }, [props.content])

  // カラム名の編集モードを開始
  const startEditingHeader = (index: number, headerName: string) => {
    setEditingHeader({ index, value: headerName })
  }

  // カラム名の編集を確定
  const confirmHeaderEdit = () => {
    if (editingHeader && editingHeader.value.trim() !== "") {
      const newCsvInstance = csvInstance.renameColumn(
        editingHeader.index,
        editingHeader.value,
      )
      updateCsvAndNotify(newCsvInstance)
      setEditingHeader(null)
    }
  }

  // カラムを削除
  const removeColumn = (index: number) => {
    const newCsvInstance = csvInstance.removeColumn(index)
    updateCsvAndNotify(newCsvInstance)
  }

  // カラムを上に移動
  const moveColumnUp = (index: number) => {
    if (index > 0) {
      const newCsvInstance = csvInstance.moveColumn(index, index - 1)
      updateCsvAndNotify(newCsvInstance)
    }
  }

  // カラムを下に移動
  const moveColumnDown = (index: number) => {
    if (index < csvInstance.headers.length - 1) {
      const newCsvInstance = csvInstance.moveColumn(index, index + 1)
      updateCsvAndNotify(newCsvInstance)
    }
  }

  // 新しいカラムを追加
  const addNewColumn = (event?: FormEvent) => {
    if (event) {
      event.preventDefault()
    }

    if (newColumnName.trim() !== "") {
      const newCsvInstance = csvInstance.addColumn(newColumnName)
      updateCsvAndNotify(newCsvInstance)
      setNewColumnName("")
    }
  }

  // CSVインスタンスを更新し、親コンポーネントに通知
  const updateCsvAndNotify = (newCsvInstance: OpenCsv) => {
    setCsvInstance(newCsvInstance)
    if (props.onChange) {
      props.onChange(newCsvInstance.toString())
    }
  }

  return (
    <Card className="h-full max-h-fit max-w-none gap-0 rounded-md p-0">
      <div className="flex items-center justify-end border-b p-2">
        <form className="flex items-center space-x-2" onSubmit={addNewColumn}>
          <Input
            className="h-9 w-40"
            onChange={(e) => setNewColumnName(e.target.value)}
            placeholder="新しいカラム名"
            value={newColumnName}
          />
          <Button
            disabled={newColumnName.trim() === ""}
            size="sm"
            type="submit"
          >
            <Plus className="mr-1 h-4 w-4" />
            {"追加"}
          </Button>
        </form>
      </div>
      <div className="flex flex-col gap-2 p-2">
        {csvInstance.headers.map((header, headerIndex) => (
          <Card
            className={"relative gap-0 p-2"}
            key={`column-${header}-${headerIndex.toFixed()}`}
          >
            <div className="flex items-center space-x-2">
              <Input
                autoFocus={editingHeader?.index === headerIndex}
                className="h-8"
                onChange={(e) =>
                  editingHeader?.index === headerIndex
                    ? setEditingHeader({
                        ...editingHeader,
                        value: e.target.value,
                      })
                    : startEditingHeader(headerIndex, e.target.value)
                }
                value={
                  editingHeader?.index === headerIndex
                    ? editingHeader.value
                    : header
                }
              />
              {editingHeader?.index === headerIndex && (
                <Button
                  className="h-8 w-8"
                  onClick={confirmHeaderEdit}
                  size="icon"
                  variant="ghost"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button
                className="h-7 w-7"
                disabled={headerIndex === 0}
                onClick={() => moveColumnUp(headerIndex)}
                size="icon"
                variant="outline"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                className="h-7 w-7"
                disabled={headerIndex === csvInstance.headers.length - 1}
                onClick={() => moveColumnDown(headerIndex)}
                size="icon"
                variant="outline"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
              <Button
                className={cn(
                  "h-7 w-7",
                  csvInstance.headers.length <= 1 && "opacity-50",
                )}
                disabled={csvInstance.headers.length <= 1}
                onClick={() => removeColumn(headerIndex)}
                size="icon"
                variant="outline"
              >
                <XCircle className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  )
}
