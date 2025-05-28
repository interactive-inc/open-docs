import { expect, test } from "bun:test"
import { OpenCsv } from "./open-csv"

test("空のCSVを作成すると検証エラーになること", () => {
  const csv = new OpenCsv("")

  expect(csv.isInvalid).toBe(true)
  expect(csv.validationErrors).toContain("CSVデータが空です")
})

test("CSVからヘッダーとレコードを取得できること", () => {
  const csvContent = "名前,年齢,職業\nTaro,30,エンジニア\nHanako,25,デザイナー"
  const csv = new OpenCsv(csvContent)

  expect(csv.isInvalid).toBe(false)
  expect(csv.headers).toEqual(["名前", "年齢", "職業"])
  expect(csv.records).toEqual([
    ["Taro", "30", "エンジニア"],
    ["Hanako", "25", "デザイナー"],
  ])
})

test("新しいカラムを追加できること", () => {
  const csvContent = "名前,年齢\nTaro,30\nHanako,25"
  const csv = new OpenCsv(csvContent)

  const newCsv = csv.addColumn("職業", "未設定")

  expect(newCsv.headers).toEqual(["名前", "年齢", "職業"])
  expect(newCsv.records).toEqual([
    ["Taro", "30", "未設定"],
    ["Hanako", "25", "未設定"],
  ])

  // 元のCSVは変更されていないこと（イミュータブル）
  expect(csv.headers).toEqual(["名前", "年齢"])
})

test("カラムを削除できること", () => {
  const csvContent = "名前,年齢,職業\nTaro,30,エンジニア\nHanako,25,デザイナー"
  const csv = new OpenCsv(csvContent)

  const newCsv = csv.removeColumn(1) // 年齢を削除

  expect(newCsv.headers).toEqual(["名前", "職業"])
  expect(newCsv.records).toEqual([
    ["Taro", "エンジニア"],
    ["Hanako", "デザイナー"],
  ])
})

test("カラムの位置を変更できること", () => {
  const csvContent = "名前,年齢,職業\nTaro,30,エンジニア\nHanako,25,デザイナー"
  const csv = new OpenCsv(csvContent)

  const newCsv = csv.moveColumn(0, 2) // 名前を最後に移動

  expect(newCsv.headers).toEqual(["年齢", "職業", "名前"])
  expect(newCsv.records).toEqual([
    ["30", "エンジニア", "Taro"],
    ["25", "デザイナー", "Hanako"],
  ])
})

test("カラムの値でレコードをソートできること", () => {
  const csvContent =
    "名前,年齢,職業\nTaro,30,エンジニア\nHanako,25,デザイナー\nJiro,40,マネージャー"
  const csv = new OpenCsv(csvContent)

  const ascCsv = csv.sortByColumn(1) // 年齢で昇順ソート
  expect(ascCsv.records).toEqual([
    ["Hanako", "25", "デザイナー"],
    ["Taro", "30", "エンジニア"],
    ["Jiro", "40", "マネージャー"],
  ])

  const descCsv = csv.sortByColumn(1, false) // 年齢で降順ソート
  expect(descCsv.records).toEqual([
    ["Jiro", "40", "マネージャー"],
    ["Taro", "30", "エンジニア"],
    ["Hanako", "25", "デザイナー"],
  ])
})

test("新しいレコードを追加できること", () => {
  const csvContent = "名前,年齢,職業\nTaro,30,エンジニア"
  const csv = new OpenCsv(csvContent)

  const newCsv = csv.addRecord(["Hanako", "25", "デザイナー"])

  expect(newCsv.records).toEqual([
    ["Taro", "30", "エンジニア"],
    ["Hanako", "25", "デザイナー"],
  ])
})

test("レコードの長さが足りない場合は空文字で埋めること", () => {
  const csvContent = "名前,年齢,職業\nTaro,30,エンジニア"
  const csv = new OpenCsv(csvContent)

  const newCsv = csv.addRecord(["Hanako", "25"])

  expect(newCsv.records).toEqual([
    ["Taro", "30", "エンジニア"],
    ["Hanako", "25", ""],
  ])
})

test("レコードを削除できること", () => {
  const csvContent = "名前,年齢,職業\nTaro,30,エンジニア\nHanako,25,デザイナー"
  const csv = new OpenCsv(csvContent)

  const newCsv = csv.removeRecord(1) // 最初のレコードを削除

  expect(newCsv.records).toEqual([["Hanako", "25", "デザイナー"]])
})

test("セルの値を更新できること", () => {
  const csvContent = "名前,年齢,職業\nTaro,30,エンジニア\nHanako,25,デザイナー"
  const csv = new OpenCsv(csvContent)

  const newCsv = csv.updateCell(1, 2, "シニアエンジニア") // Taroの職業を更新

  expect(newCsv.records).toEqual([
    ["Taro", "30", "シニアエンジニア"],
    ["Hanako", "25", "デザイナー"],
  ])
})

test("カラム名を変更できること", () => {
  const csvContent = "名前,年齢,職業\nTaro,30,エンジニア\nHanako,25,デザイナー"
  const csv = new OpenCsv(csvContent)

  const newCsv = csv.renameColumn(1, "Age")

  expect(newCsv.headers).toEqual(["名前", "Age", "職業"])
})
