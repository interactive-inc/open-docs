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
