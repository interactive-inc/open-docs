import { expect, test } from "bun:test"
import { DocSchemaFieldBooleanSingleValue } from "./doc-schema-field-boolean-single-value"
import { DocSchemaFieldFactory } from "./doc-schema-field-factory"
import { DocSchemaFieldNumberSingleValue } from "./doc-schema-field-number-single-value"
import { DocSchemaFieldRelationMultipleValue } from "./doc-schema-field-relation-multiple-value"
import { DocSchemaFieldRelationSingleValue } from "./doc-schema-field-relation-single-value"
import { DocSchemaFieldSelectTextSingleValue } from "./doc-schema-field-select-text-single-value"
import { DocSchemaFieldTextMultipleValue } from "./doc-schema-field-text-multiple-value"
import { DocSchemaFieldTextSingleValue } from "./doc-schema-field-text-single-value"

test("テキスト型フィールドを生成できる", () => {
  const factory = new DocSchemaFieldFactory()
  const field = factory.fromSchemaEntry("title", {
    type: "text",
    required: true,
    title: "タイトル",
    description: null,
    default: null,
  })

  expect(field).toBeInstanceOf(DocSchemaFieldTextSingleValue)
  expect(field.key).toBe("title")
  expect(field.type).toBe("text")
})

test("数値型フィールドを生成できる", () => {
  const factory = new DocSchemaFieldFactory()
  const field = factory.fromSchemaEntry("price", {
    type: "number",
    required: false,
    title: null,
    description: null,
    default: 1000,
  })

  expect(field).toBeInstanceOf(DocSchemaFieldNumberSingleValue)
  expect(field.type).toBe("number")
  expect(field.default).toBe(1000)
})

test("ブール型フィールドを生成できる", () => {
  const factory = new DocSchemaFieldFactory()
  const field = factory.fromSchemaEntry("published", {
    type: "boolean",
    required: true,
    title: null,
    description: null,
    default: false,
  })

  expect(field).toBeInstanceOf(DocSchemaFieldBooleanSingleValue)
  expect(field.type).toBe("boolean")
})

test("リレーション型フィールドを生成できる", () => {
  const factory = new DocSchemaFieldFactory()
  const field = factory.fromSchemaEntry("author", {
    type: "relation",
    required: true,
    title: null,
    description: null,
    default: null,
    path: "users/authors",
  })

  expect(field).toBeInstanceOf(DocSchemaFieldRelationSingleValue)
  expect(field.type).toBe("relation")
  expect((field as DocSchemaFieldRelationSingleValue).path).toBe(
    "users/authors",
  )
})

test("選択型フィールドを生成できる", () => {
  const factory = new DocSchemaFieldFactory()
  const field = factory.fromSchemaEntry("status", {
    type: "select-text",
    required: false,
    title: null,
    description: null,
    default: null,
    options: ["draft", "published"],
  })

  expect(field).toBeInstanceOf(DocSchemaFieldSelectTextSingleValue)
  expect((field as DocSchemaFieldSelectTextSingleValue).options).toEqual([
    "draft",
    "published",
  ])
})

test("複数型フィールドを生成できる", () => {
  const factory = new DocSchemaFieldFactory()
  const field = factory.fromSchemaEntry("tags", {
    type: "multi-text",
    required: false,
    title: null,
    description: null,
    default: ["tech", "news"],
  })

  expect(field).toBeInstanceOf(DocSchemaFieldTextMultipleValue)
  expect(field.isArray).toBe(true)
  expect(field.default).toEqual(["tech", "news"])
})

test("複数リレーション型フィールドを生成できる", () => {
  const factory = new DocSchemaFieldFactory()
  const field = factory.fromSchemaEntry("categories", {
    type: "multi-relation",
    required: false,
    title: null,
    description: null,
    default: null,
    path: "metadata/categories",
  })

  expect(field).toBeInstanceOf(DocSchemaFieldRelationMultipleValue)
  expect((field as DocSchemaFieldRelationMultipleValue).path).toBe(
    "metadata/categories",
  )
})

test("不明な型でエラーが発生する", () => {
  const factory = new DocSchemaFieldFactory()

  expect(() => {
    factory.fromSchemaEntry("unknown", {
      type: "invalid-type" as any,
      required: false,
      title: null,
      description: null,
      default: null,
    })
  }).toThrow()
})

test("fromUnknownメソッドで未検証データから生成できる", () => {
  const factory = new DocSchemaFieldFactory()

  // 正しいデータ
  const field1 = factory.fromUnknown("field1", {
    type: "text",
    required: true,
    title: null,
    description: null,
    default: null,
  })
  expect(field1).toBeInstanceOf(DocSchemaFieldTextSingleValue)

  // 型が古い形式
  const field2 = factory.fromUnknown("field2", {
    type: "string",
    required: false,
    title: null,
    description: null,
    default: null,
  })
  expect(field2).toBeInstanceOf(DocSchemaFieldTextSingleValue)
  expect(field2.type).toBe("text")

  // オブジェクトでない場合
  const field3 = factory.fromUnknown("field3", null)
  expect(field3).toBeInstanceOf(DocSchemaFieldTextSingleValue)
  expect(field3.required).toBe(false)

  // 必須プロパティが欠けている場合
  const field4 = factory.fromUnknown("field4", {})
  expect(field4).toBeInstanceOf(DocSchemaFieldTextSingleValue)
  expect(field4.type).toBe("text")
  expect(field4.required).toBe(false)
})

test("型固有のデフォルト値が設定される", () => {
  const factory = new DocSchemaFieldFactory()

  // リレーション型でpathが無い場合
  const relation = factory.fromUnknown("rel", {
    type: "relation",
    required: true,
    title: null,
    description: null,
    default: null,
  })
  expect((relation as DocSchemaFieldRelationSingleValue).path).toBe("")

  // 選択型でoptionsが無い場合
  const select = factory.fromUnknown("sel", {
    type: "select-text",
    required: false,
    title: null,
    description: null,
    default: null,
  })
  expect((select as DocSchemaFieldSelectTextSingleValue).options).toEqual([])
})

test("multi-string型をmulti-textに正規化する", () => {
  const factory = new DocSchemaFieldFactory()
  const field = factory.fromUnknown("field", {
    type: "multi-string",
    required: false,
    title: null,
    description: null,
    default: null,
  })

  expect(field).toBeInstanceOf(DocSchemaFieldTextMultipleValue)
  expect(field.type).toBe("multi-text")
})

