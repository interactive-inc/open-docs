import { expect, test } from "bun:test"
import { DocFileMdMetaValue } from "./doc-file-md-meta-value"

test("DocFileMdMetaValue - 基本的な作成とプロパティアクセス", () => {
  const value = new DocFileMdMetaValue(
    {
      title: "ドキュメントタイトル",
      description: "ドキュメントの説明",
      tags: ["tag1", "tag2"],
      author: "作者名",
    },
    {
      title: { type: "text", required: false },
      description: { type: "text", required: false },
      tags: { type: "multi-text", required: false },
      author: { type: "text", required: false },
    },
  )

  expect(value.value.title).toBe("ドキュメントタイトル")
  expect(value.value.description).toBe("ドキュメントの説明")
  expect(value.value.tags).toEqual(["tag1", "tag2"])
  expect(value.value.author).toBe("作者名")
})

test("DocFileMdMetaValue - 空のFrontMatter", () => {
  const value = new DocFileMdMetaValue({}, {})

  expect(value.value).toEqual({})
})

test("DocFileMdMetaValue - fieldメソッド", () => {
  const value = new DocFileMdMetaValue(
    {
      title: "タイトル",
      count: 42,
    },
    {
      title: { type: "text", required: false },
      count: { type: "number", required: false },
    },
  )

  expect(value.field("title")).toBe("タイトル")
  expect(value.field("count")).toBe(42)
})

test("DocFileMdMetaValue - hasKeyメソッド", () => {
  const value = new DocFileMdMetaValue(
    {
      title: "タイトル",
    },
    {
      title: { type: "text", required: false },
      description: { type: "text", required: false },
    },
  )

  expect(value.hasKey("title")).toBe(true)
  expect(value.hasKey("description")).toBe(false)
})

test("DocFileMdMetaValue - requiredフィールド", () => {
  expect(() => {
    new DocFileMdMetaValue({} as never, {
      title: { type: "text", required: true },
    })
  }).toThrow('Required field "title" is missing')
})

test("DocFileMdMetaValue - withPropertyメソッド", () => {
  const value = new DocFileMdMetaValue(
    {
      title: "元のタイトル",
    },
    {
      title: { type: "text", required: false },
    },
  )

  const updated = value.withProperty("title", "新しいタイトル")

  expect(value.value.title).toBe("元のタイトル")
  expect(updated.value.title).toBe("新しいタイトル")
})
