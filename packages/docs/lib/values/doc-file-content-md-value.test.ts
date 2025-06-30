import { expect, test } from "bun:test"
import { DocFileContentMdValue } from "./doc-file-content-md-value"
import { DocFrontMatterMdValue } from "./doc-front-matter-md-value"

test("DocFileContentMdValue - 基本的な作成とプロパティアクセス", () => {
  const value = new DocFileContentMdValue({
    type: "markdown-content",
    body: "# タイトル\n\n説明文\n\n本文",
    title: "タイトル",
    description: "説明文",
    frontMatter: {
      title: "メタタイトル",
      description: "メタ説明",
      tags: ["tag1", "tag2"],
    },
  })

  expect(value.body).toBe("# タイトル\n\n説明文\n\n本文")
  expect(value.title).toBe("タイトル")
  expect(value.description).toBe("説明文")
})

test("DocFileContentMdValue - frontMatter getterが値オブジェクトを返す", () => {
  const value = new DocFileContentMdValue({
    type: "markdown-content",
    body: "",
    title: "",
    description: "",
    frontMatter: {
      author: "作者名",
    },
  })

  const frontMatter = value.frontMatter
  expect(frontMatter).toBeInstanceOf(DocFrontMatterMdValue)
  expect(frontMatter.value.author).toBe("作者名")
})

test("DocFileContentMdValue - withTitleで新しいインスタンスを作成", () => {
  const value = new DocFileContentMdValue({
    type: "markdown-content",
    body: "# 古いタイトル\n\n説明文",
    title: "古いタイトル",
    description: "説明文",
    frontMatter: {},
  })

  const newValue = value.withTitle("新しいタイトル")

  expect(newValue).not.toBe(value) // 新しいインスタンス
  expect(newValue.title).toBe("新しいタイトル")
  expect(newValue.body).toContain("# 新しいタイトル")
  expect(value.title).toBe("古いタイトル") // 元は変更されない
})

test("DocFileContentMdValue - withDescriptionで新しいインスタンスを作成", () => {
  const value = new DocFileContentMdValue({
    type: "markdown-content",
    body: "# タイトル\n\n古い説明",
    title: "タイトル",
    description: "古い説明",
    frontMatter: {},
  })

  const newValue = value.withDescription("新しい説明")

  expect(newValue).not.toBe(value)
  expect(newValue.description).toBe("新しい説明")
  expect(newValue.body).toContain("新しい説明")
})

test("DocFileContentMdValue - withContentで新しいインスタンスを作成", () => {
  const value = new DocFileContentMdValue({
    type: "markdown-content",
    body: "古い内容",
    title: "タイトル",
    description: "説明",
    frontMatter: {},
  })

  const newValue = value.withContent("新しい内容")

  expect(newValue).not.toBe(value)
  expect(newValue.body).toBe("新しい内容")
  // タイトルは新しい内容から解析される
  expect(newValue.title).toBe("")
  expect(newValue.description).toBe("")
})

test("DocFileContentMdValue - withFrontMatterで新しいインスタンスを作成", () => {
  const value = new DocFileContentMdValue({
    type: "markdown-content",
    body: "# タイトル",
    title: "タイトル",
    description: "",
    frontMatter: {
      tags: ["old"],
    },
  })

  const newFrontMatter = new DocFrontMatterMdValue({
    tags: ["new", "tags"],
    author: "新しい作者",
  })

  const newValue = value.withFrontMatter(newFrontMatter)

  expect(newValue).not.toBe(value)
  expect(newValue.frontMatter.value.tags).toEqual(["new", "tags"])
  expect(newValue.frontMatter.value.author).toBe("新しい作者")
  expect(value.frontMatter.value.tags).toEqual(["old"]) // 元は変更されない
})

test("DocFileContentMdValue - fromMarkdownでMarkdownから生成", () => {
  const markdown = `---
title: "メタタイトル"
description: "メタ説明"
tags: ["tag1", "tag2"]
---

# ドキュメントタイトル

これは説明文です。

本文の内容`

  const value = DocFileContentMdValue.fromMarkdown(markdown)

  expect(value.title).toBe("ドキュメントタイトル")
  expect(value.description).toBe("これは説明文です。")
  expect(value.body).toContain("# ドキュメントタイトル")
  expect(value.frontMatter.value.tags).toEqual(["tag1", "tag2"])
})

test("DocFileContentMdValue - emptyでデフォルトコンテンツを生成", () => {
  const value = DocFileContentMdValue.empty("テストファイル")

  expect(value.title).toBe("テストファイル")
  expect(value.frontMatter.value).toEqual({})
  expect(value.body).toBe("# テストファイル")
})

test("DocFileContentMdValue - toTextでFrontMatter付きテキストを生成", () => {
  const value = new DocFileContentMdValue({
    type: "markdown-content",
    body: "# タイトル\n\n本文",
    title: "タイトル",
    description: "",
    frontMatter: {
      date: "2024-01-01",
    },
  })

  const text = value.toText()

  expect(text).toContain("---")
  expect(text).toContain("date: ")
  expect(text).toContain("# タイトル")
  expect(text).toContain("本文")
})

test("DocFileContentMdValue - toMarkdownTextでbodyのみのテキストを生成", () => {
  const value = new DocFileContentMdValue({
    type: "markdown-content",
    body: "既存の本文",
    title: "タイトル",
    description: "説明",
    frontMatter: {},
  })

  const text = value.toMarkdownText()

  expect(text).toBe("# タイトル\n\n説明\n\n既存の本文")
  expect(text).not.toContain("---") // FrontMatterは含まない
})

test("DocFileContentMdValue - toJsonで元のデータ構造を返す", () => {
  const data = {
    type: "markdown-content" as const,
    body: "# タイトル",
    title: "タイトル",
    description: "説明",
    frontMatter: {
      tags: ["tag1"],
    },
  }

  const value = new DocFileContentMdValue(data)
  expect(value.toJson()).toEqual(data)
})
