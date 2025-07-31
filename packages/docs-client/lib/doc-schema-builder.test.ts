import { expect, test } from "bun:test"
import { DocSchemaBuilder } from "./doc-schema-builder"

test("DocSchemaBuilder - 基本的なスキーマ構築", () => {
  const schema = new DocSchemaBuilder()
    .text("title", true)
    .number("priority", false)
    .boolean("published", true)
    .build()

  expect(schema).toEqual({
    title: { type: "text", required: true },
    priority: { type: "number", required: false },
    published: { type: "boolean", required: true },
  })
})

test("DocSchemaBuilder - リレーション系フィールド", () => {
  const schema = new DocSchemaBuilder()
    .relation("category", true)
    .multiRelation("tags", false)
    .build()

  expect(schema).toEqual({
    category: { type: "relation", required: true },
    tags: { type: "multi-relation", required: false },
  })
})

test("DocSchemaBuilder - 選択系フィールド", () => {
  const schema = new DocSchemaBuilder()
    .selectText("status", true)
    .selectNumber("level", false)
    .multiSelectText("categories", true)
    .multiSelectNumber("scores", false)
    .build()

  expect(schema).toEqual({
    status: { type: "select-text", required: true },
    level: { type: "select-number", required: false },
    categories: { type: "multi-select-text", required: true },
    scores: { type: "multi-select-number", required: false },
  })
})

test("DocSchemaBuilder - 複数値フィールド", () => {
  const schema = new DocSchemaBuilder()
    .multiText("keywords", true)
    .multiNumber("ratings", false)
    .build()

  expect(schema).toEqual({
    keywords: { type: "multi-text", required: true },
    ratings: { type: "multi-number", required: false },
  })
})

test("DocSchemaBuilder - チェーンメソッドの型安全性", () => {
  const schema = new DocSchemaBuilder()
    .text("title", true)
    .number("priority", false)
    .boolean("published", true)
    .relation("author", true)
    .multiRelation("contributors", false)
    .selectText("status", true)
    .selectNumber("difficulty", false)
    .multiText("tags", true)
    .multiNumber("scores", false)
    .multiSelectText("categories", true)
    .multiSelectNumber("levels", false)
    .build()

  expect(Object.keys(schema)).toHaveLength(11)
  expect(schema.title).toEqual({ type: "text", required: true })
  expect(schema.priority).toEqual({ type: "number", required: false })
  expect(schema.published).toEqual({ type: "boolean", required: true })
  expect(schema.author).toEqual({ type: "relation", required: true })
  expect(schema.contributors).toEqual({
    type: "multi-relation",
    required: false,
  })
  expect(schema.status).toEqual({ type: "select-text", required: true })
  expect(schema.difficulty).toEqual({ type: "select-number", required: false })
  expect(schema.tags).toEqual({ type: "multi-text", required: true })
  expect(schema.scores).toEqual({ type: "multi-number", required: false })
  expect(schema.categories).toEqual({
    type: "multi-select-text",
    required: true,
  })
  expect(schema.levels).toEqual({
    type: "multi-select-number",
    required: false,
  })
})

test("DocSchemaBuilder - 空のスキーマ", () => {
  const schema = new DocSchemaBuilder().build()
  expect(schema).toEqual({})
})

test("DocSchemaBuilder - 同じキーで上書き", () => {
  const schema = new DocSchemaBuilder()
    .text("title", true)
    .text("title", false) // 上書き
    .build()

  expect(schema).toEqual({
    title: { type: "text", required: false },
  })
})

test("DocSchemaBuilder - 既存スキーマから開始", () => {
  const baseSchema = {
    id: { type: "number" as const, required: true },
  }

  const schema = new DocSchemaBuilder(baseSchema)
    .text("title", true)
    .boolean("published", false)
    .build()

  expect(schema).toEqual({
    id: { type: "number", required: true },
    title: { type: "text", required: true },
    published: { type: "boolean", required: false },
  })
})

test("DocSchemaBuilder - フルエントインターフェースの型チェック", () => {
  // コンパイル時の型チェックを確認するテスト
  const builder = new DocSchemaBuilder()

  // メソッドチェーンが正しく型を返すことを確認
  const step1 = builder.text("title", true)
  const step2 = step1.number("priority", false)
  const step3 = step2.boolean("published", true)
  const finalSchema = step3.build()

  expect(finalSchema.title).toEqual({ type: "text", required: true })
  expect(finalSchema.priority).toEqual({ type: "number", required: false })
  expect(finalSchema.published).toEqual({ type: "boolean", required: true })
})
