import { expect, test } from "bun:test"
import { z } from "zod"
import { DocSchemaFieldRelationMultipleValue } from "./doc-schema-field-relation-multiple-value"
import { DocSchemaFieldRelationSingleValue } from "./doc-schema-field-relation-single-value"
import { DocSchemaFieldTextSingleValue } from "./doc-schema-field-text-single-value"
import { DocSchemaValue } from "./doc-schema-value"

test("スキーマの基本プロパティを取得できる", () => {
  const schema = new DocSchemaValue({
    title: {
      type: "text",
      required: true,
      title: null,
      description: null,
      default: null,
    },
    author: {
      type: "relation",
      required: false,
      path: "users/authors",
      title: null,
      description: null,
      default: null,
    },
  })

  expect(schema.fieldNames).toEqual(["title", "author"])
})

test("フィールドを名前で取得できる", () => {
  const schema = new DocSchemaValue({
    title: {
      type: "text",
      required: true,
      title: "タイトル",
      description: null,
      default: null,
    },
  })

  const field = schema.field("title")
  expect(field).toBeInstanceOf(DocSchemaFieldTextSingleValue)
  expect(field?.key).toBe("title")
  expect(field?.title).toBe("タイトル")
})

test("存在しないフィールドの場合nullを返す", () => {
  const schema = new DocSchemaValue({})
  expect(schema.field("nonexistent")).toBeNull()
})

test("全フィールドを取得できる", () => {
  const schema = new DocSchemaValue({
    title: {
      type: "text",
      required: true,
      title: null,
      description: null,
      default: null,
    },
    price: {
      type: "number",
      required: false,
      title: null,
      description: null,
      default: null,
    },
    published: {
      type: "boolean",
      required: true,
      title: null,
      description: null,
      default: null,
    },
  })

  const fields = schema.fields
  expect(fields.length).toBe(3)
  expect(fields[0].key).toBe("title")
  expect(fields[1].key).toBe("price")
  expect(fields[2].key).toBe("published")
})

test("リレーションフィールドのみを取得できる", () => {
  const schema = new DocSchemaValue({
    title: {
      type: "text",
      required: true,
      title: null,
      description: null,
      default: null,
    },
    author: {
      type: "relation",
      required: false,
      path: "users/authors",
      title: null,
      description: null,
      default: null,
    },
    tags: {
      type: "multi-relation",
      required: false,
      path: "metadata/tags",
      title: null,
      description: null,
      default: null,
    },
    description: {
      type: "text",
      required: false,
      title: null,
      description: null,
      default: null,
    },
  })

  const relationFields = schema.relationFields
  expect(relationFields.length).toBe(2)
  expect(relationFields[0]).toBeInstanceOf(DocSchemaFieldRelationSingleValue)
  expect(relationFields[1]).toBeInstanceOf(DocSchemaFieldRelationMultipleValue)
})

test("空のスキーマを作成できる", () => {
  const schema = DocSchemaValue.empty()
  expect(schema.fieldNames).toEqual([])
  expect(schema.fields).toEqual([])
})

test("リレーションパスを抽出できる", () => {
  const schema = new DocSchemaValue({
    author: {
      type: "relation",
      required: false,
      path: "users/authors",
      title: null,
      description: null,
      default: null,
    },
    category: {
      type: "relation",
      required: false,
      path: "categories",
      title: null,
      description: null,
      default: null,
    },
    tags: {
      type: "multi-relation",
      required: false,
      path: "metadata/tags",
      title: null,
      description: null,
      default: null,
    },
    title: {
      type: "text",
      required: true,
      title: null,
      description: null,
      default: null,
    },
  })

  const paths = schema.extractRelationPaths()
  expect(paths.size).toBe(3)
  expect(paths.has("users/authors")).toBe(true)
  expect(paths.has("categories")).toBe(true)
  expect(paths.has("metadata/tags")).toBe(true)
})

test("リレーションオプションを作成できる", () => {
  const schema = new DocSchemaValue({})
  const option = schema.createRelationOption("users/tanaka.md", "田中太郎")

  expect(option.value).toBe("tanaka")
  expect(option.label).toBe("田中太郎")
  expect(option.path).toBe("users/tanaka.md")
})

test("タイトルがnullの場合ファイル名をラベルとして使用する", () => {
  const schema = new DocSchemaValue({})
  const option = schema.createRelationOption("categories/tech.md", null)

  expect(option.value).toBe("tech")
  expect(option.label).toBe("tech")
})

test("ファイルをスキップすべきか判定できる", () => {
  const schema = new DocSchemaValue({})

  expect(schema.shouldSkipFile("docs/index.md")).toBe(true)
  expect(schema.shouldSkipFile("docs/README.md")).toBe(true)
  expect(schema.shouldSkipFile("docs/article.md")).toBe(false)
})

test("値を指定された型に変換できる", () => {
  const schema = new DocSchemaValue({})

  // テキスト型への変換
  expect(schema.convertValue(123, "text", "default")).toBe("123")
  expect(schema.convertValue(true, "text", "default")).toBe("true")
  expect(schema.convertValue(null, "text", "default")).toBe("default")

  // 数値型への変換
  expect(schema.convertValue("123", "number", 0)).toBe(123)
  expect(schema.convertValue(true, "number", 0)).toBe(1)
  expect(schema.convertValue(false, "number", 0)).toBe(0)
  expect(schema.convertValue("invalid", "number", 0)).toBe(0)

  // ブール型への変換
  expect(schema.convertValue("true", "boolean", false)).toBe(true)
  expect(schema.convertValue("1", "boolean", false)).toBe(true)
  expect(schema.convertValue("false", "boolean", false)).toBe(false)
  expect(schema.convertValue(0, "boolean", false)).toBe(false)
  expect(schema.convertValue(1, "boolean", false)).toBe(true)

  // 配列型への変換
  expect(schema.convertValue("a,b,c", "multi-text", [])).toEqual([
    "a",
    "b",
    "c",
  ])
  expect(schema.convertValue(["x", "y"], "array", [])).toEqual(["x", "y"])

  // リレーション型への変換
  expect(schema.convertValue("users/tanaka.md", "relation", "")).toBe("tanaka")
  expect(schema.convertValue("tanaka", "relation", "")).toBe("tanaka")

  // マルチリレーション型への変換
  expect(schema.convertValue("a.md,b.md", "multi-relation", [])).toEqual([
    "a",
    "b",
  ])
  expect(schema.convertValue(["x.md", "y.md"], "multi-relation", [])).toEqual([
    "x",
    "y",
  ])
})

test("スキーマベースでFrontMatterを補完できる", () => {
  const schema = new DocSchemaValue({
    title: {
      type: "text",
      required: true,
      default: "無題",
      title: null,
      description: null,
    },
    published: {
      type: "boolean",
      required: false,
      default: false,
      title: null,
      description: null,
    },
    tags: {
      type: "multi-text",
      required: false,
      default: [],
      title: null,
      description: null,
    },
  })

  const result = schema.getCompleteFrontMatter({
    title: "記事タイトル",
  })

  expect(result).toEqual({
    title: "記事タイトル",
    published: false,
    tags: [],
  })
})

test("既存の値を保持しながらデフォルト値を補完する", () => {
  const schema = new DocSchemaValue({
    title: {
      type: "text",
      required: true,
      default: "無題",
      title: null,
      description: null,
    },
    author: {
      type: "text",
      required: false,
      default: "匿名",
      title: null,
      description: null,
    },
    published: {
      type: "boolean",
      required: false,
      default: false,
      title: null,
      description: null,
    },
  })

  const result = schema.getCompleteFrontMatter({
    author: "田中太郎",
    published: true,
  })

  expect(result).toEqual({
    title: "無題",
    author: "田中太郎",
    published: true,
  })
})

test("JSON形式に変換できる", () => {
  const schemaData = {
    field1: {
      type: "text" as const,
      required: true,
      title: null,
      description: null,
      default: null,
    },
    field2: {
      type: "number" as const,
      required: false,
      title: null,
      description: null,
      default: null,
    },
  }

  const schema = new DocSchemaValue(schemaData)
  const json = schema.toJson()

  expect(json).toEqual(schemaData)
})

// 以下は doc-schema-value-generic.test.ts から統合されたテスト

test("DocSchemaValue - 動的スキーマ生成で検証できる", () => {
  // typeとrequiredのみを持つ最小限のスキーマ
  const minimalSchema = {
    name: {
      type: "text",
      required: true,
    },
    age: {
      type: "number",
      required: false,
    },
  }

  const value = new DocSchemaValue(minimalSchema)

  expect(value.value.name).toEqual({
    type: "text",
    required: true,
    title: null,
    description: null,
    default: "",
  })

  expect(value.value.age).toEqual({
    type: "number",
    required: false,
    title: null,
    description: null,
    default: 0,
  })
})

test("DocSchemaValue - カスタムZodスキーマで検証できる", () => {
  // カスタムZodスキーマ
  const customSchema = z.object({
    name: z.object({
      type: z.literal("text"),
      required: z.literal(true),
      title: z.string(),
      description: z.string(),
      default: z.string(),
    }),
  })

  const schemaData = {
    name: {
      type: "text",
      required: true,
      title: "名前",
      description: "ユーザーの名前",
      default: "ゲスト",
    },
  }

  const value = new DocSchemaValue(schemaData, customSchema)

  expect(value.value.name).toEqual({
    type: "text",
    required: true,
    title: "名前",
    description: "ユーザーの名前",
    default: "ゲスト",
  })
})

test("DocSchemaValue - 無効なフィールドでエラーが発生する", () => {
  // typeがない無効なフィールド
  const invalidSchema = {
    name: {
      required: true,
    },
  }

  expect(() => new DocSchemaValue(invalidSchema)).toThrow(
    'Field "name" must have "type" and "required" properties',
  )
})

test("DocSchemaValue - 無効なtypeでエラーが発生する", () => {
  const invalidSchema = {
    name: {
      type: "invalid-type",
      required: true,
    },
  }

  expect(() => new DocSchemaValue(invalidSchema)).toThrow(
    'Field "name"',
  )
})

test("DocSchemaValue - スキーマがオブジェクトでない場合エラーが発生する", () => {
  expect(() => new DocSchemaValue("invalid")).toThrow(
    "Schema must be an object",
  )
  expect(() => new DocSchemaValue(null)).toThrow("Schema must be an object")
  expect(() => new DocSchemaValue([])).toThrow()
})

test("DocSchemaValue - フィールドがオブジェクトでない場合エラーが発生する", () => {
  const invalidSchema = {
    name: "string-value",
  }

  expect(() => new DocSchemaValue(invalidSchema)).toThrow(
    'Field "name" must be an object',
  )
})

test("DocSchemaValue - リレーションフィールドでpathが必須", () => {
  const schemaWithRelation = {
    author: {
      type: "relation",
      required: true,
      path: "authors",
    },
  }

  const value = new DocSchemaValue(schemaWithRelation)

  expect(value.value.author).toEqual({
    type: "relation",
    required: true,
    title: null,
    description: null,
    path: "authors",
    default: null,
  })
})

test("DocSchemaValue - カスタムZodスキーマで空のスキーマを作成できる", () => {
  const customSchema = z.object({})
  const value = DocSchemaValue.empty(customSchema)
  expect(value.value).toEqual({})
})
