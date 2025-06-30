import { expect, test } from "bun:test"
import { DocSchemaFieldBooleanMultipleValue } from "./doc-schema-field-boolean-multiple-value"

test("複数ブール型フィールドの基本プロパティを取得できる", () => {
  const field = new DocSchemaFieldBooleanMultipleValue("features", {
    type: "multi-boolean",
    required: true,
    title: "機能フラグ",
    description: "有効な機能のリスト",
    default: [true, false, true],
  })

  expect(field.key).toBe("features")
  expect(field.type).toBe("multi-boolean")
  expect(field.required).toBe(true)
  expect(field.title).toBe("機能フラグ")
  expect(field.description).toBe("有効な機能のリスト")
  expect(field.default).toEqual([true, false, true])
})

test("配列判定メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldBooleanMultipleValue("flags", {
    type: "multi-boolean",
    required: false,
  })

  expect(field.isArray).toBe(true)
  expect(field.isSingle).toBe(false)
  expect(field.isBoolean).toBe(true)
})

test("値の検証メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldBooleanMultipleValue("options", {
    type: "multi-boolean",
    required: true,
  })

  expect(field.validate([true, false, true])).toBe(true)
  expect(field.validate([])).toBe(true)
  expect(field.validate([true])).toBe(true)

  expect(field.validate(true)).toBe(false)
  expect(field.validate([true, "false"])).toBe(false)
  expect(field.validate([1, 0])).toBe(false)
  expect(field.validate(null)).toBe(false)
  expect(field.validate(undefined)).toBe(false)
  expect(field.validate({})).toBe(false)
})

test("オプショナルなプロパティがundefinedでも動作する", () => {
  const field = new DocSchemaFieldBooleanMultipleValue("settings", {
    type: "multi-boolean",
    required: true,
  })

  expect(field.title).toBeUndefined()
  expect(field.description).toBeUndefined()
  expect(field.default).toBeUndefined()
})

test("JSON形式に変換できる", () => {
  const field = new DocSchemaFieldBooleanMultipleValue("permissions", {
    type: "multi-boolean",
    required: false,
    title: "権限設定",
    default: [false, false],
  })

  const json = field.toJson()
  expect(json).toEqual({
    type: "multi-boolean",
    required: false,
    title: "権限設定",
    default: [false, false],
  })
})

test("インスタンスが不変である", () => {
  const fieldData = {
    type: "multi-boolean" as const,
    required: true,
    default: [true, false],
  }

  const field = new DocSchemaFieldBooleanMultipleValue("test", fieldData)

  expect(() => {
    ;(field as any).key = "changed"
  }).toThrow()

  expect(() => {
    ;(field.default as any).push(true)
  }).toThrow()
})
