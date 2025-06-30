import { expect, test } from "bun:test"
import { DocSchemaFieldRelationMultipleValue } from "./doc-schema-field-relation-multiple-value"

test("複数リレーション型フィールドの基本プロパティを取得できる", () => {
  const field = new DocSchemaFieldRelationMultipleValue("tags", {
    type: "multi-relation",
    required: true,
    title: "タグ",
    description: "記事のタグ",
    default: ["tech", "news"],
    path: "metadata/tags",
  })

  expect(field.key).toBe("tags")
  expect(field.type).toBe("multi-relation")
  expect(field.required).toBe(true)
  expect(field.title).toBe("タグ")
  expect(field.description).toBe("記事のタグ")
  expect(field.default).toEqual(["tech", "news"])
  expect(field.path).toBe("metadata/tags")
})

test("型判定メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldRelationMultipleValue("authors", {
    type: "multi-relation",
    required: false,
    path: "users/authors",
  })

  expect(field.isArray).toBe(true)
  expect(field.isSingle).toBe(false)
  expect(field.isRelation).toBe(true)
})

test("値の検証メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldRelationMultipleValue("members", {
    type: "multi-relation",
    required: true,
    path: "users/members",
  })

  expect(field.validate(["user1", "user2"])).toBe(true)
  expect(field.validate([])).toBe(true)
  expect(field.validate(["single"])).toBe(true)

  expect(field.validate("string")).toBe(false)
  expect(field.validate([123, 456])).toBe(false)
  expect(field.validate(["valid", 123])).toBe(false)
  expect(field.validate(null)).toBe(false)
  expect(field.validate(undefined)).toBe(false)
  expect(field.validate({})).toBe(false)
})

test("オプショナルなプロパティがundefinedでも動作する", () => {
  const field = new DocSchemaFieldRelationMultipleValue("related", {
    type: "multi-relation",
    required: true,
    path: "related",
  })

  expect(field.title).toBeUndefined()
  expect(field.description).toBeUndefined()
  expect(field.default).toBeUndefined()
})

test("JSON形式に変換できる", () => {
  const field = new DocSchemaFieldRelationMultipleValue("categories", {
    type: "multi-relation",
    required: false,
    title: "カテゴリ",
    default: ["tech"],
    path: "metadata/categories",
  })

  const json = field.toJson()
  expect(json).toEqual({
    type: "multi-relation",
    required: false,
    title: "カテゴリ",
    default: ["tech"],
    path: "metadata/categories",
  })
})

test("インスタンスが不変である", () => {
  const fieldData = {
    type: "multi-relation" as const,
    required: true,
    path: "tags",
    default: ["tag1", "tag2"],
  }

  const field = new DocSchemaFieldRelationMultipleValue("test", fieldData)

  expect(() => {
    ;(field as any).key = "changed"
  }).toThrow()

  expect(() => {
    ;(field.default as any).push("tag3")
  }).toThrow()
})
