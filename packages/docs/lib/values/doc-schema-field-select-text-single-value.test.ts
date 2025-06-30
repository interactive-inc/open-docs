import { expect, test } from "bun:test"
import { DocSchemaFieldSelectTextSingleValue } from "./doc-schema-field-select-text-single-value"

test("単一選択テキスト型フィールドの基本プロパティを取得できる", () => {
  const field = new DocSchemaFieldSelectTextSingleValue("status", {
    type: "select-text",
    required: true,
    title: "ステータス",
    description: "記事の状態",
    default: "draft",
    options: ["draft", "published", "archived"],
  })

  expect(field.key).toBe("status")
  expect(field.type).toBe("select-text")
  expect(field.required).toBe(true)
  expect(field.title).toBe("ステータス")
  expect(field.description).toBe("記事の状態")
  expect(field.default).toBe("draft")
  expect(field.options).toEqual(["draft", "published", "archived"])
})

test("型判定メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldSelectTextSingleValue("category", {
    type: "select-text",
    required: false,
    options: ["tech", "business", "lifestyle"],
  })

  expect(field.isArray).toBe(false)
  expect(field.isSingle).toBe(true)
  expect(field.isSelect).toBe(true)
  expect(field.isTextSelect).toBe(true)
})

test("値の検証メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldSelectTextSingleValue("priority", {
    type: "select-text",
    required: true,
    options: ["low", "medium", "high"],
  })

  expect(field.validate("low")).toBe(true)
  expect(field.validate("medium")).toBe(true)
  expect(field.validate("high")).toBe(true)
  expect(field.validate("")).toBe(true)

  expect(field.validate(123)).toBe(false)
  expect(field.validate(true)).toBe(false)
  expect(field.validate(null)).toBe(false)
  expect(field.validate(undefined)).toBe(false)
  expect(field.validate([])).toBe(false)
  expect(field.validate({})).toBe(false)
})

test("オプショナルなプロパティがundefinedでも動作する", () => {
  const field = new DocSchemaFieldSelectTextSingleValue("type", {
    type: "select-text",
    required: true,
    options: ["A", "B", "C"],
  })

  expect(field.title).toBeUndefined()
  expect(field.description).toBeUndefined()
  expect(field.default).toBeUndefined()
})

test("空のオプション配列でも動作する", () => {
  const field = new DocSchemaFieldSelectTextSingleValue("empty", {
    type: "select-text",
    required: false,
    options: [],
  })

  expect(field.options).toEqual([])
})

test("JSON形式に変換できる", () => {
  const field = new DocSchemaFieldSelectTextSingleValue("role", {
    type: "select-text",
    required: false,
    title: "役割",
    default: "user",
    options: ["admin", "user", "guest"],
  })

  const json = field.toJson()
  expect(json).toEqual({
    type: "select-text",
    required: false,
    title: "役割",
    default: "user",
    options: ["admin", "user", "guest"],
  })
})

test("インスタンスが不変である", () => {
  const fieldData = {
    type: "select-text" as const,
    required: true,
    options: ["A", "B", "C"],
  }

  const field = new DocSchemaFieldSelectTextSingleValue("test", fieldData)

  expect(() => {
    ;(field as any).key = "changed"
  }).toThrow()

  expect(() => {
    ;(field.options as any).push("D")
  }).toThrow()
})
