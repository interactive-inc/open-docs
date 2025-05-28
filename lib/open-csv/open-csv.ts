type CsvData = string[][]

/**
 * CSVデータを操作するためのイミュータブルなクラス
 */
export class OpenCsv {
  private readonly data: CsvData
  private readonly errors: string[] = []

  /**
   * CSVデータからCsvクラスのインスタンスを作成する
   * @param contentOrData 文字列形式のCSVデータまたは二次元配列形式のCSVデータ
   */
  constructor(contentOrData: string | CsvData) {
    if (typeof contentOrData === "string") {
      this.data = this.parse(contentOrData)
    } else {
      this.data = contentOrData.map((row) => [...row])
    }
    this.validate()
  }

  /**
   * CSVの生データを取得する
   */
  get rawData(): CsvData {
    return [...this.data]
  }

  /**
   * CSVのヘッダー行を取得する
   */
  get headers(): string[] {
    return this.data[0] ? [...this.data[0]] : []
  }

  /**
   * CSVのレコード行（ヘッダーを除く）を取得する
   */
  get records(): string[][] {
    return this.data.slice(1).map((row) => [...row])
  }

  /**
   * CSVデータが無効かどうかを取得する
   */
  get isInvalid(): boolean {
    return this.errors.length > 0
  }

  /**
   * バリデーションエラーを取得する
   */
  get validationErrors(): string[] {
    return [...this.errors]
  }

  /**
   * CSVデータを文字列に変換する
   */
  toString(): string {
    return this.data.map((row) => row.join(",")).join("\n")
  }

  /**
   * 新しいカラムを追加する
   */
  addColumn(header: string, defaultValue = ""): OpenCsv {
    const newData: CsvData = this.data.map((row, index) => {
      if (index === 0) {
        return [...row, header]
      }
      return [...row, defaultValue]
    })

    const newCsv = new OpenCsv("")
    return this.createNewInstance(newCsv, newData)
  }

  /**
   * カラムを削除する
   */
  removeColumn(columnIndex: number): OpenCsv {
    if (columnIndex < 0 || !this.headers[columnIndex]) {
      return this
    }

    const newData: CsvData = this.data.map((row) => {
      return row.filter((_, index) => index !== columnIndex)
    })

    const newCsv = new OpenCsv("")
    return this.createNewInstance(newCsv, newData)
  }

  /**
   * カラムの位置を変更する
   */
  moveColumn(fromIndex: number, toIndex: number): OpenCsv {
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= this.headers.length ||
      toIndex >= this.headers.length ||
      fromIndex === toIndex
    ) {
      return this
    }

    const newData: CsvData = this.data.map((row) => {
      const newRow = [...row]
      const [movedItem] = newRow.splice(fromIndex, 1)
      if (movedItem !== undefined) {
        newRow.splice(toIndex, 0, movedItem)
      }
      return newRow
    })

    const newCsv = new OpenCsv("")
    return this.createNewInstance(newCsv, newData)
  }

  /**
   * カラムの値でレコードをソートする
   */
  sortByColumn(columnIndex: number, ascending = true): OpenCsv {
    if (columnIndex < 0 || columnIndex >= this.headers.length) {
      return this
    }

    const header = this.data[0] || []
    const records = this.data.slice(1)

    const sortedRecords = [...records].sort((a, b) => {
      const valueA = a[columnIndex] || ""
      const valueB = b[columnIndex] || ""

      return ascending
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA)
    })

    const newData: CsvData = [header, ...sortedRecords]
    const newCsv = new OpenCsv("")
    return this.createNewInstance(newCsv, newData)
  }

  /**
   * 新しいレコードを追加する
   */
  addRecord(record: string[]): OpenCsv {
    if (record.length !== this.headers.length) {
      const paddedRecord = [...record]

      // レコードの長さがヘッダーより短い場合は空文字を追加
      while (paddedRecord.length < this.headers.length) {
        paddedRecord.push("")
      }

      // レコードの長さがヘッダーより長い場合は切り詰める
      if (paddedRecord.length > this.headers.length) {
        paddedRecord.length = this.headers.length
      }

      const newData = [...this.data, paddedRecord]
      const newCsv = new OpenCsv("")
      return this.createNewInstance(newCsv, newData)
    }

    const newData = [...this.data, [...record]]
    const newCsv = new OpenCsv("")
    return this.createNewInstance(newCsv, newData)
  }

  /**
   * レコードを削除する
   */
  removeRecord(index: number): OpenCsv {
    // ヘッダー行は削除しない
    if (index <= 0 || index >= this.data.length) {
      return this
    }

    const newData = [
      ...this.data.slice(0, index),
      ...this.data.slice(index + 1),
    ]

    const newCsv = new OpenCsv("")
    return this.createNewInstance(newCsv, newData)
  }

  /**
   * セルの値を更新する
   */
  updateCell(rowIndex: number, columnIndex: number, value: string): OpenCsv {
    if (
      rowIndex < 0 ||
      columnIndex < 0 ||
      rowIndex >= this.data.length ||
      columnIndex >= this.headers.length
    ) {
      return this
    }

    const newData = this.data.map((row, rIndex) => {
      if (rIndex === rowIndex) {
        const newRow = [...row]
        newRow[columnIndex] = value
        return newRow
      }
      return [...row]
    })

    const newCsv = new OpenCsv("")
    return this.createNewInstance(newCsv, newData)
  }

  /**
   * カラム名を変更する
   */
  renameColumn(columnIndex: number, newName: string): OpenCsv {
    return this.updateCell(0, columnIndex, newName)
  }

  /**
   * CSVをパースする
   */
  private parse(content: string): CsvData {
    if (!content.trim()) {
      return []
    }

    return content
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => line.split(","))
  }

  /**
   * CSVデータを検証する
   */
  private validate(): void {
    this.errors.length = 0

    // データがない場合
    if (this.data.length === 0) {
      this.errors.push("CSVデータが空です")
      return
    }

    // ヘッダーがない場合
    const header = this.data[0]
    if (!header || header.length === 0) {
      this.errors.push("CSVヘッダーが空です")
      return
    }

    const headerLength = header.length

    // 各行の列数をチェック
    for (let i = 1; i < this.data.length; i++) {
      const row = this.data[i]
      if (row && row.length !== headerLength) {
        this.errors.push(
          `行${i + 1}の列数がヘッダーと一致しません（ヘッダー: ${headerLength}, 行: ${row.length}）`,
        )
      }
    }
  }

  /**
   * 新しいインスタンスを作成し、データをコピーする
   */
  private createNewInstance(instance: OpenCsv, data: CsvData): OpenCsv {
    return new OpenCsv(data)
  }
}
