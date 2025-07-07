import { expect, test } from "bun:test"
import { DocFrontMatterMdValue } from "./doc-front-matter-md-value"

test("DocFrontMatterMdValue - 基本的な作成とプロパティアクセス", () => {
  const value = new DocFrontMatterMdValue({
    title: "ドキュメントタイトル",
    description: "ドキュメントの説明",
    tags: ["tag1", "tag2"],
    author: "作者名",
  })

  expect(value.value.title).toBe("ドキュメントタイトル")
  expect(value.value.description).toBe("ドキュメントの説明")
  expect(value.value.tags).toEqual(["tag1", "tag2"])
  expect(value.value.author).toBe("作者名")
})

test("DocFrontMatterMdValue - 空のFrontMatter", () => {
  const value = new DocFrontMatterMdValue({})

  expect(value.value).toEqual({})
})

test("DocFrontMatterMdValue - 一部のフィールドのみ", () => {
  const value = new DocFrontMatterMdValue({
    title: "タイトルのみ",
  })

  expect(value.value.title).toBe("タイトルのみ")
  expect(value.value.description).toBeUndefined()
  expect(value.value.tags).toBeUndefined()
})

test("DocFrontMatterMdValue - toYamlでYAML文字列を生成", () => {
  const value = new DocFrontMatterMdValue({
    title: "タイトル",
    tags: ["tag1", "tag2"],
  })

  const yaml = value.toYaml()

  expect(yaml).toContain("title: タイトル")
  expect(yaml).toContain("tags:")
  expect(yaml).toContain("  - tag1")
  expect(yaml).toContain("  - tag2")
})

test("DocFrontMatterMdValue - 空のFrontMatterでtoYaml", () => {
  const value = new DocFrontMatterMdValue({})

  const yaml = value.toYaml()

  expect(yaml).toBe("{}")
})

test("DocFrontMatterMdValue - 特殊文字を含む値でtoYaml", () => {
  const value = new DocFrontMatterMdValue({
    title: "タイトル with \"quotes\" and 'apostrophes'",
    description: "説明文\n改行あり",
  })

  const yaml = value.toYaml()

  expect(yaml).toContain("title:")
  expect(yaml).toContain("description:")
  // YAMLライブラリが適切にエスケープすることを確認
})

test("DocFrontMatterMdValue - toJsonで元のデータ構造を返す", () => {
  const data = {
    title: "タイトル",
    tags: ["tag1"],
    custom: "カスタムフィールド",
  }

  const value = new DocFrontMatterMdValue(data)
  expect(value.toJson()).toEqual(data)
})

test("DocFrontMatterMdValue - 不変性の確認", () => {
  const value = new DocFrontMatterMdValue({
    title: "タイトル",
  })

  expect(() => {
    // @ts-expect-error - 不変性のテスト
    value.value = {}
  }).toThrow()
})

test("text メソッドでテキスト型の値を取得できる", () => {
  const frontMatter = new DocFrontMatterMdValue({
    title: "テストタイトル",
    description: "説明文",
    count: 42,
  })

  expect(frontMatter.text("title")).toBe("テストタイトル")
  expect(frontMatter.text("description")).toBe("説明文")
  expect(frontMatter.text("count")).toBeNull() // 数値型なのでnull
  expect(frontMatter.text("missing")).toBeNull() // 存在しないキー
})

test("number メソッドで数値型の値を取得できる", () => {
  const frontMatter = new DocFrontMatterMdValue({
    count: 42,
    version: 1.5,
    title: "テスト",
  })

  expect(frontMatter.number("count")).toBe(42)
  expect(frontMatter.number("version")).toBe(1.5)
  expect(frontMatter.number("title")).toBeNull() // 文字列型なのでnull
  expect(frontMatter.number("missing")).toBeNull()
})

test("boolean メソッドで真偽値型の値を取得できる", () => {
  const frontMatter = new DocFrontMatterMdValue({
    published: true,
    draft: false,
    title: "テスト",
  })

  expect(frontMatter.boolean("published")).toBe(true)
  expect(frontMatter.boolean("draft")).toBe(false)
  expect(frontMatter.boolean("title")).toBeNull()
  expect(frontMatter.boolean("missing")).toBeNull()
})

test("relation メソッドで単一リレーションを取得できる", () => {
  const frontMatter = new DocFrontMatterMdValue({
    author: "user-123",
    category: "tech",
    tags: ["tag1", "tag2"],
  })

  expect(frontMatter.relation("author")).toBe("user-123")
  expect(frontMatter.relation("category")).toBe("tech")
  expect(frontMatter.relation("tags")).toBeNull() // 配列なのでnull
  expect(frontMatter.relation("missing")).toBeNull()
})

test("multiRelation メソッドで複数リレーションを取得できる", () => {
  const frontMatter = new DocFrontMatterMdValue({
    features: ["login", "logout", "signup"],
    tags: ["tech", "tutorial"],
    single: "value",
  })

  expect(frontMatter.multiRelation("features")).toEqual([
    "login",
    "logout",
    "signup",
  ])
  expect(frontMatter.multiRelation("tags")).toEqual(["tech", "tutorial"])
  expect(frontMatter.multiRelation("single")).toEqual([]) // 単一値なので空配列
  expect(frontMatter.multiRelation("missing")).toEqual([])
})

test("multiText メソッドで複数テキストを取得できる", () => {
  const frontMatter = new DocFrontMatterMdValue({
    keywords: ["typescript", "javascript", "nodejs"],
    authors: ["alice", "bob"],
  })

  expect(frontMatter.multiText("keywords")).toEqual([
    "typescript",
    "javascript",
    "nodejs",
  ])
  expect(frontMatter.multiText("authors")).toEqual(["alice", "bob"])
  expect(frontMatter.multiText("missing")).toEqual([])
})

test("multiNumber メソッドで複数数値を取得できる", () => {
  const frontMatter = new DocFrontMatterMdValue({
    scores: [85, 90, 78],
    versions: [1.0, 1.1, 2.0],
  })

  expect(frontMatter.multiNumber("scores")).toEqual([85, 90, 78])
  expect(frontMatter.multiNumber("versions")).toEqual([1.0, 1.1, 2.0])
  expect(frontMatter.multiNumber("missing")).toEqual([])
})

test("multiBoolean メソッドで複数真偽値を取得できる", () => {
  const frontMatter = new DocFrontMatterMdValue({
    flags: [true, false, true],
    permissions: [false, false],
  })

  expect(frontMatter.multiBoolean("flags")).toEqual([true, false, true])
  expect(frontMatter.multiBoolean("permissions")).toEqual([false, false])
  expect(frontMatter.multiBoolean("missing")).toEqual([])
})

test("has メソッドでプロパティの存在を確認できる", () => {
  const frontMatter = new DocFrontMatterMdValue({
    title: "テスト",
    count: 0,
    flag: false,
    nullable: null,
  })

  expect(frontMatter.has("title")).toBe(true)
  expect(frontMatter.has("count")).toBe(true)
  expect(frontMatter.has("flag")).toBe(true)
  expect(frontMatter.has("nullable")).toBe(true)
  expect(frontMatter.has("missing")).toBe(false)
})

test("keys ゲッターですべてのキーを取得できる", () => {
  const frontMatter = new DocFrontMatterMdValue({
    title: "テスト",
    version: 1.0,
    published: true,
  })

  const keys = frontMatter.keys
  expect(keys).toHaveLength(3)
  expect(keys).toContain("title")
  expect(keys).toContain("version")
  expect(keys).toContain("published")
})

test("空のFrontMatterでも正常に動作する", () => {
  const frontMatter = DocFrontMatterMdValue.empty()

  expect(frontMatter.text("any")).toBeNull()
  expect(frontMatter.number("any")).toBeNull()
  expect(frontMatter.boolean("any")).toBeNull()
  expect(frontMatter.relation("any")).toBeNull()
  expect(frontMatter.multiRelation("any")).toEqual([])
  expect(frontMatter.multiText("any")).toEqual([])
  expect(frontMatter.multiNumber("any")).toEqual([])
  expect(frontMatter.multiBoolean("any")).toEqual([])
  expect(frontMatter.has("any")).toBe(false)
  expect(frontMatter.keys).toEqual([])
})
