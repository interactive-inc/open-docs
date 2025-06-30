import { expect, test } from "bun:test"
import { DocFileContentIndexValue } from "./doc-file-content-index-value"
import { DocFrontMatterIndexValue } from "./doc-front-matter-index-value"

test("DocFileContentIndexValue - 基本的な作成とプロパティアクセス", () => {
  const value = new DocFileContentIndexValue({
    type: "markdown-index",
    body: "# タイトル\n\n説明文\n\n本文",
    title: "タイトル",
    description: "説明文",
    frontMatter: {
      type: "index-frontmatter",
      icon: "📁",
      schema: {
        name: {
          type: "text",
          required: true,
          title: "名前",
          description: "項目の名前",
          default: "",
        },
      },
    },
  })

  expect(value.body).toBe("# タイトル\n\n説明文\n\n本文")
  expect(value.title).toBe("タイトル")
  expect(value.description).toBe("説明文")
  expect(value.frontMatter.icon).toBe("📁")
})

test("DocFileContentIndexValue - frontMatter getterが値オブジェクトを返す", () => {
  const value = new DocFileContentIndexValue({
    type: "markdown-index",
    body: "",
    title: "",
    description: "",
    frontMatter: {
      type: "index-frontmatter",
      icon: "📁",
      schema: {},
    },
  })

  const frontMatter = value.frontMatter
  expect(frontMatter).toBeInstanceOf(DocFrontMatterIndexValue)
  expect(frontMatter.icon).toBe("📁")
})

test("DocFileContentIndexValue - withTitleで新しいインスタンスを作成", () => {
  const value = new DocFileContentIndexValue({
    type: "markdown-index",
    body: "# 古いタイトル\n\n説明文",
    title: "古いタイトル",
    description: "説明文",
    frontMatter: {
      type: "index-frontmatter",
      icon: "",
      schema: {},
    },
  })

  const newValue = value.withTitle("新しいタイトル")

  expect(newValue).not.toBe(value) // 新しいインスタンス
  expect(newValue.title).toBe("新しいタイトル")
  expect(newValue.body).toContain("# 新しいタイトル")
  expect(value.title).toBe("古いタイトル") // 元は変更されない
})

test("DocFileContentIndexValue - withDescriptionで新しいインスタンスを作成", () => {
  const value = new DocFileContentIndexValue({
    type: "markdown-index",
    body: "# タイトル\n\n古い説明",
    title: "タイトル",
    description: "古い説明",
    frontMatter: {
      type: "index-frontmatter",
      icon: "",
      schema: {},
    },
  })

  const newValue = value.withDescription("新しい説明")

  expect(newValue).not.toBe(value)
  expect(newValue.description).toBe("新しい説明")
  expect(newValue.body).toContain("新しい説明")
})

test("DocFileContentIndexValue - withContentで新しいインスタンスを作成", () => {
  const value = new DocFileContentIndexValue({
    type: "markdown-index",
    body: "古い内容",
    title: "タイトル",
    description: "説明",
    frontMatter: {
      type: "index-frontmatter",
      icon: "",
      schema: {},
    },
  })

  const newValue = value.withContent("新しい内容")

  expect(newValue).not.toBe(value)
  expect(newValue.body).toBe("新しい内容")
  // タイトルは新しい内容から解析される
  expect(newValue.title).toBe("")
  expect(newValue.description).toBe("")
})

test("DocFileContentIndexValue - withFrontMatterで新しいインスタンスを作成", () => {
  const value = new DocFileContentIndexValue({
    type: "markdown-index",
    body: "# タイトル",
    title: "タイトル",
    description: "",
    frontMatter: {
      type: "index-frontmatter",
      icon: "📁",
      schema: {},
    },
  })

  const newFrontMatter = new DocFrontMatterIndexValue({
    type: "index-frontmatter",
    icon: "📂",
    schema: {
      test: {
        type: "text",
        required: false,
        title: "テスト",
        description: "テスト項目",
        default: "",
      },
    },
  })

  const newValue = value.withFrontMatter(newFrontMatter)

  expect(newValue).not.toBe(value)
  expect(newValue.frontMatter.icon).toBe("📂")
  expect(value.frontMatter.icon).toBe("📁") // 元は変更されない
})

test("DocFileContentIndexValue - fromMarkdownでMarkdownから生成", () => {
  const markdown = `---
title: "メタタイトル"
description: "メタ説明"
icon: "📁"
schema: {}
---

# ドキュメントタイトル

これは説明文です。

本文の内容`

  const value = DocFileContentIndexValue.fromMarkdown(markdown)

  expect(value.title).toBe("ドキュメントタイトル")
  expect(value.description).toBe("これは説明文です。")
  expect(value.body).toContain("# ドキュメントタイトル")
  expect(value.frontMatter.icon).toBe("📁")
})

test("DocFileContentIndexValue - emptyでデフォルトコンテンツを生成", () => {
  const value = DocFileContentIndexValue.empty("テストディレクトリ")

  expect(value.title).toBe("テストディレクトリ")
  expect(value.frontMatter.icon).toBe("")
  expect(value.frontMatter.schema.toJson()).toEqual({})
  expect(value.body).toContain("# テストディレクトリ")
})

test("DocFileContentIndexValue - toTextでFrontMatter付きテキストを生成", () => {
  const value = new DocFileContentIndexValue({
    type: "markdown-index",
    body: "# タイトル\n\n本文",
    title: "タイトル",
    description: "",
    frontMatter: {
      type: "index-frontmatter",
      icon: "📁",
      schema: {},
    },
  })

  const text = value.toText()

  expect(text).toContain("---")
  expect(text).toContain("icon: 📁")
  expect(text).toContain("# タイトル")
  expect(text).toContain("本文")
})

test("DocFileContentIndexValue - toMarkdownTextでbodyのみのテキストを生成", () => {
  const value = new DocFileContentIndexValue({
    type: "markdown-index",
    body: "既存の本文",
    title: "タイトル",
    description: "説明",
    frontMatter: {
      type: "index-frontmatter",
      icon: "",
      schema: {},
    },
  })

  const text = value.toMarkdownText()

  expect(text).toBe("# タイトル\n\n説明\n\n既存の本文")
  expect(text).not.toContain("---") // FrontMatterは含まない
})

test("DocFileContentIndexValue - toJsonで元のデータ構造を返す", () => {
  const data = {
    type: "markdown-index" as const,
    body: "# タイトル",
    title: "タイトル",
    description: "説明",
    frontMatter: {
      type: "index-frontmatter" as const,
      icon: "📁",
      schema: {},
    },
  }

  const value = new DocFileContentIndexValue(data)
  expect(value.toJson()).toEqual(data)
})
