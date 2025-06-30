import { expect, test } from "bun:test"
import { DocSchemaFieldSelectTextMultipleValue } from "./doc-schema-field-select-text-multiple-value"

test("複数選択テキスト型フィールドの基本プロパティを取得できる", () => {
  const field = new DocSchemaFieldSelectTextMultipleValue("tags", {
    type: "multi-select-text",
    required: true,
    title: "タグ",
    description: "記事のタグ",
    default: ["tech", "news"],
    options: ["tech", "news", "opinion", "tutorial"],
  })

  expect(field.key).toBe("tags")
  expect(field.type).toBe("multi-select-text")
  expect(field.required).toBe(true)
  expect(field.title).toBe("タグ")
  expect(field.description).toBe("記事のタグ")
  expect(field.default).toEqual(["tech", "news"])
  expect(field.options).toEqual(["tech", "news", "opinion", "tutorial"])
})

test("型判定メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldSelectTextMultipleValue("categories", {
    type: "multi-select-text",
    required: false,
    options: ["A", "B", "C"],
  })

  expect(field.isArray).toBe(true)
  expect(field.isSingle).toBe(false)
  expect(field.isSelect).toBe(true)
  expect(field.isTextSelect).toBe(true)
})

test("値の検証メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldSelectTextMultipleValue("skills", {
    type: "multi-select-text",
    required: true,
    options: ["JavaScript", "TypeScript", "React"],
  })

  expect(field.validate(["JavaScript", "React"])).toBe(true)
  expect(field.validate([])).toBe(true)
  expect(field.validate(["JavaScript"])).toBe(true)

  expect(field.validate("JavaScript")).toBe(false)
  expect(field.validate([123, 456])).toBe(false)
  expect(field.validate(["JavaScript", 123])).toBe(false)
  expect(field.validate(null)).toBe(false)
  expect(field.validate(undefined)).toBe(false)
  expect(field.validate({})).toBe(false)
})

test("オプショナルなプロパティがundefinedでも動作する", () => {
  const field = new DocSchemaFieldSelectTextMultipleValue("items", {
    type: "multi-select-text",
    required: true,
    options: ["X", "Y", "Z"],
  })

  expect(field.title).toBeUndefined()
  expect(field.description).toBeUndefined()
  expect(field.default).toBeUndefined()
})

test("JSON形式に変換できる", () => {
  const field = new DocSchemaFieldSelectTextMultipleValue("permissions", {
    type: "multi-select-text",
    required: false,
    title: "権限",
    default: ["read"],
    options: ["read", "write", "delete"],
  })

  const json = field.toJson()
  expect(json).toEqual({
    type: "multi-select-text",
    required: false,
    title: "権限",
    default: ["read"],
    options: ["read", "write", "delete"],
  })
})

test("インスタンスが不変である", () => {
  const fieldData = {
    type: "multi-select-text" as const,
    required: true,
    options: ["A", "B"],
    default: ["A"],
  }

  const field = new DocSchemaFieldSelectTextMultipleValue("test", fieldData)

  expect(() => {
    ;(field as any).key = "changed"
  }).toThrow()

  // オプション配列は不変
  expect(() => {
    field.options.push("C")
  }).toThrow()

  // デフォルト配列は不変
  expect(() => {
    field.default.push("B")
  }).toThrow()
})
