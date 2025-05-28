import { Button } from "@/app/_components/ui/button"
import { Card } from "@/app/_components/ui/card"
import { Input } from "@/app/_components/ui/input"
import { OpenCsv } from "@/lib/open-csv/open-csv"
import { cn } from "@/lib/utils"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Plus,
  SortAsc,
  SortDesc,
  XCircle,
} from "lucide-react"
import { type FormEvent, useEffect, useState } from "react"

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
  const [sortInfo, setSortInfo] = useState<{
    columnIndex: number
    ascending: boolean
  } | null>(null)

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
    // ソート中のカラムが削除された場合はソート情報をクリア
    if (sortInfo?.columnIndex === index) {
      setSortInfo(null)
    } else if (sortInfo && sortInfo.columnIndex > index) {
      // 削除されたカラムより後ろのカラムでソートしていた場合はインデックスを調整
      setSortInfo({
        ...sortInfo,
        columnIndex: sortInfo.columnIndex - 1,
      })
    }
  }

  // カラムを上に移動
  const moveColumnUp = (index: number) => {
    if (index > 0) {
      const newCsvInstance = csvInstance.moveColumn(index, index - 1)
      updateCsvAndNotify(newCsvInstance)

      // ソート中のカラムを移動した場合はソート情報も更新
      if (sortInfo) {
        if (sortInfo.columnIndex === index) {
          setSortInfo({
            ...sortInfo,
            columnIndex: index - 1,
          })
        } else if (sortInfo.columnIndex === index - 1) {
          setSortInfo({
            ...sortInfo,
            columnIndex: index,
          })
        }
      }
    }
  }

  // カラムを下に移動
  const moveColumnDown = (index: number) => {
    if (index < csvInstance.headers.length - 1) {
      const newCsvInstance = csvInstance.moveColumn(index, index + 1)
      updateCsvAndNotify(newCsvInstance)

      // ソート中のカラムを移動した場合はソート情報も更新
      if (sortInfo) {
        if (sortInfo.columnIndex === index) {
          setSortInfo({
            ...sortInfo,
            columnIndex: index + 1,
          })
        } else if (sortInfo.columnIndex === index + 1) {
          setSortInfo({
            ...sortInfo,
            columnIndex: index,
          })
        }
      }
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

  // カラムでソートする
  const sortByColumn = (columnIndex: number) => {
    // 同じカラムの場合は昇順/降順を切り替え、違うカラムなら昇順で開始
    const ascending =
      sortInfo?.columnIndex === columnIndex ? !sortInfo.ascending : true

    const newCsvInstance = csvInstance.sortByColumn(columnIndex, ascending)
    updateCsvAndNotify(newCsvInstance)
    setSortInfo({ columnIndex, ascending })
  }

  // ソートをクリア
  const clearSort = () => {
    // 元のCSVデータを復元（現在のUIからは直接できないため、再パースする）
    const newCsvInstance = new OpenCsv(props.content)
    updateCsvAndNotify(newCsvInstance)
    setSortInfo(null)
  }

  // CSVインスタンスを更新し、親コンポーネントに通知
  const updateCsvAndNotify = (newCsvInstance: OpenCsv) => {
    setCsvInstance(newCsvInstance)
    if (props.onChange) {
      props.onChange(newCsvInstance.toString())
    }
  }

  return (
    <Card className="h-full max-h-fit max-w-none gap-0 p-0">
      <div className="flex items-center justify-between border-b p-2">
        <div className="flex items-center space-x-2">
          {sortInfo && (
            <div className="flex items-center space-x-1 rounded-md border bg-background px-2.5 py-0.5 font-semibold text-xs">
              <span className="font-medium">
                {csvInstance.headers[sortInfo.columnIndex]}
              </span>
              {sortInfo.ascending ? (
                <SortAsc className="h-3 w-3" />
              ) : (
                <SortDesc className="h-3 w-3" />
              )}
              <Button
                className="h-5 w-5 rounded-full"
                onClick={clearSort}
                size="icon"
                variant="ghost"
              >
                <XCircle className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
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
            追加
          </Button>
        </form>
      </div>

      <div className="flex flex-col gap-2 p-2">
        {csvInstance.headers.map((header, headerIndex) => {
          const uniqueKey = `column-${header}-${headerIndex}`
          return (
            <Card className={"relative gap-0 p-2"} key={uniqueKey}>
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
                  className="h-7 w-7"
                  onClick={() => sortByColumn(headerIndex)}
                  size="icon"
                  variant="outline"
                >
                  <ArrowUpDown className="h-3 w-3" />
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
                {sortInfo?.columnIndex === headerIndex && (
                  <span className="font-medium text-xs">
                    {sortInfo.ascending ? "昇順" : "降順"}
                  </span>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </Card>
  )
}
