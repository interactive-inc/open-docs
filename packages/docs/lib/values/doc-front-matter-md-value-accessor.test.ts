import { expect, test } from "bun:test"
import { DocFrontMatterMdValue } from "./doc-front-matter-md-value"

test("text メソッドは文字列型の値のみを返す", () => {
  const frontMatter = new DocFrontMatterMdValue({
    title: "正しいタイトル",
    count: 123,
    flag: true,
    list: ["item1", "item2"],
    obj: { key: "value" },
    nullable: null,
  })

  // 文字列型は正しく取得
  expect(frontMatter.text("title")).toBe("正しいタイトル")

  // 他の型はnullを返す
  expect(frontMatter.text("count")).toBeNull()
  expect(frontMatter.text("flag")).toBeNull()
  expect(frontMatter.text("list")).toBeNull()
  expect(frontMatter.text("obj")).toBeNull()
  expect(frontMatter.text("nullable")).toBeNull()
  expect(frontMatter.text("missing")).toBeNull()
})

test("number メソッドは数値型の値のみを返す", () => {
  const frontMatter = new DocFrontMatterMdValue({
    count: 42,
    price: 99.99,
    title: "文字列",
    flag: false,
    list: [1, 2, 3],
  })

  // 数値型は正しく取得
  expect(frontMatter.number("count")).toBe(42)
  expect(frontMatter.number("price")).toBe(99.99)

  // 他の型はnullを返す
  expect(frontMatter.number("title")).toBeNull()
  expect(frontMatter.number("flag")).toBeNull()
  expect(frontMatter.number("list")).toBeNull()
})

test("boolean メソッドは真偽値型の値のみを返す", () => {
  const frontMatter = new DocFrontMatterMdValue({
    published: true,
    draft: false,
    title: "文字列",
    count: 0,
    zero: 0,
    empty: "",
  })

  // 真偽値型は正しく取得
  expect(frontMatter.boolean("published")).toBe(true)
  expect(frontMatter.boolean("draft")).toBe(false)

  // 他の型はnullを返す（0や空文字列も）
  expect(frontMatter.boolean("title")).toBeNull()
  expect(frontMatter.boolean("count")).toBeNull()
  expect(frontMatter.boolean("zero")).toBeNull()
  expect(frontMatter.boolean("empty")).toBeNull()
})

test("relation メソッドは文字列型の値を返す（単一リレーション）", () => {
  const frontMatter = new DocFrontMatterMdValue({
    author: "user-123",
    category: "tech-blog",
    tags: ["tag1", "tag2"],
    count: 123,
  })

  // 文字列型のリレーションは正しく取得
  expect(frontMatter.relation("author")).toBe("user-123")
  expect(frontMatter.relation("category")).toBe("tech-blog")

  // 配列や他の型はnullを返す
  expect(frontMatter.relation("tags")).toBeNull()
  expect(frontMatter.relation("count")).toBeNull()
})

test("multiRelation メソッドは文字列配列のみを返す", () => {
  const frontMatter = new DocFrontMatterMdValue({
    features: ["login", "logout", "signup"],
    tags: ["tech", "tutorial", "beginner"],
    emptyArray: [],
    singleString: "not-array",
    numberArray: [1, 2, 3],
  })

  // 文字列配列は正しく取得
  expect(frontMatter.multiRelation("features")).toEqual([
    "login",
    "logout",
    "signup",
  ])
  expect(frontMatter.multiRelation("tags")).toEqual([
    "tech",
    "tutorial",
    "beginner",
  ])
  expect(frontMatter.multiRelation("emptyArray")).toEqual([])

  // 単一値や数値配列は空配列を返す
  expect(frontMatter.multiRelation("singleString")).toEqual([])
  expect(frontMatter.multiRelation("numberArray")).toEqual([])
  expect(frontMatter.multiRelation("missing")).toEqual([])
})

test("multiText メソッドは文字列配列を返す", () => {
  const frontMatter = new DocFrontMatterMdValue({
    keywords: ["typescript", "javascript", "nodejs"],
    authors: ["alice", "bob", "charlie"],
    empty: [],
    notArray: "single-value",
  })

  // 文字列配列は正しく取得
  expect(frontMatter.multiText("keywords")).toEqual([
    "typescript",
    "javascript",
    "nodejs",
  ])
  expect(frontMatter.multiText("authors")).toEqual(["alice", "bob", "charlie"])
  expect(frontMatter.multiText("empty")).toEqual([])

  // 非配列は空配列を返す
  expect(frontMatter.multiText("notArray")).toEqual([])
  expect(frontMatter.multiText("missing")).toEqual([])
})

test("multiNumber メソッドは数値配列のみを返す", () => {
  const frontMatter = new DocFrontMatterMdValue({
    scores: [85, 90, 78],
    prices: [19.99, 29.99, 39.99],
    empty: [],
    stringArray: ["1", "2", "3"],
    singleNumber: 42,
  })

  // 数値配列は正しく取得
  expect(frontMatter.multiNumber("scores")).toEqual([85, 90, 78])
  expect(frontMatter.multiNumber("prices")).toEqual([19.99, 29.99, 39.99])
  expect(frontMatter.multiNumber("empty")).toEqual([])

  // 文字列配列や単一値は空配列を返す
  expect(frontMatter.multiNumber("stringArray")).toEqual([])
  expect(frontMatter.multiNumber("singleNumber")).toEqual([])
  expect(frontMatter.multiNumber("missing")).toEqual([])
})

test("multiBoolean メソッドは真偽値配列のみを返す", () => {
  const frontMatter = new DocFrontMatterMdValue({
    flags: [true, false, true, true],
    permissions: [false, false],
    empty: [],
    stringArray: ["true", "false"],
    singleBool: true,
  })

  // 真偽値配列は正しく取得
  expect(frontMatter.multiBoolean("flags")).toEqual([true, false, true, true])
  expect(frontMatter.multiBoolean("permissions")).toEqual([false, false])
  expect(frontMatter.multiBoolean("empty")).toEqual([])

  // 文字列配列や単一値は空配列を返す
  expect(frontMatter.multiBoolean("stringArray")).toEqual([])
  expect(frontMatter.multiBoolean("singleBool")).toEqual([])
  expect(frontMatter.multiBoolean("missing")).toEqual([])
})

test("has メソッドはプロパティの存在を正しく判定", () => {
  const frontMatter = new DocFrontMatterMdValue({
    title: "タイトル",
    count: 0,
    flag: false,
    empty: "",
    nullable: null,
    list: [],
  })

  // 値が存在すればtrueを返す（falsy値でも）
  expect(frontMatter.has("title")).toBe(true)
  expect(frontMatter.has("count")).toBe(true)
  expect(frontMatter.has("flag")).toBe(true)
  expect(frontMatter.has("empty")).toBe(true)
  expect(frontMatter.has("nullable")).toBe(true)
  expect(frontMatter.has("list")).toBe(true)

  // 存在しないキーはfalse
  expect(frontMatter.has("missing")).toBe(false)
  expect(frontMatter.has("notDefined")).toBe(false)
})

test("keys ゲッターはすべてのキーを返す", () => {
  const frontMatter = new DocFrontMatterMdValue({
    title: "テスト",
    version: 1.0,
    published: true,
    tags: ["tag1", "tag2"],
  })

  const keys = frontMatter.keys
  expect(keys).toHaveLength(4)
  expect(keys).toContain("title")
  expect(keys).toContain("version")
  expect(keys).toContain("published")
  expect(keys).toContain("tags")

  // 順序は保証されないので、セットで比較
  expect(new Set(keys)).toEqual(
    new Set(["title", "version", "published", "tags"]),
  )
})

test("特殊なケース：存在しないキーへのアクセス", () => {
  const frontMatter = new DocFrontMatterMdValue({
    title: "テスト",
  })

  expect(frontMatter.has("title")).toBe(true)
  expect(frontMatter.has("undefinedValue")).toBe(false)
  expect(frontMatter.text("undefinedValue")).toBeNull()
})

test("型の厳密な検証：文字列の数値は数値として扱われない", () => {
  const frontMatter = new DocFrontMatterMdValue({
    stringNumber: "123",
    stringBool: "true",
    actualNumber: 123,
    actualBool: true,
  })

  // 文字列の"123"は数値として取得できない
  expect(frontMatter.number("stringNumber")).toBeNull()
  expect(frontMatter.text("stringNumber")).toBe("123")

  // 文字列の"true"は真偽値として取得できない
  expect(frontMatter.boolean("stringBool")).toBeNull()
  expect(frontMatter.text("stringBool")).toBe("true")

  // 実際の数値と真偽値は正しく取得
  expect(frontMatter.number("actualNumber")).toBe(123)
  expect(frontMatter.boolean("actualBool")).toBe(true)
})

test("ネストしたオブジェクトは適切に扱われる", () => {
  const frontMatter = new DocFrontMatterMdValue({
    meta: {
      author: "John",
      version: 1.0,
    },
    config: {
      enabled: true,
      settings: ["a", "b"],
    },
  })

  // ネストしたオブジェクトは文字列や他の型として取得できない
  expect(frontMatter.text("meta")).toBeNull()
  expect(frontMatter.text("config")).toBeNull()

  // ただし、存在はする
  expect(frontMatter.has("meta")).toBe(true)
  expect(frontMatter.has("config")).toBe(true)
})
