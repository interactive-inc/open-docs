import { expect, test } from "bun:test"
import { defaultTestConfig } from "../utils"
import { DocFileIndexContentValue } from "./doc-file-index-content-value"

test("DocFileContentIndexValue - 基本的な作成とプロパティアクセス", () => {
  const value = new DocFileIndexContentValue(
    {
      type: "markdown-index",
      body: "# タイトル\n\n説明文\n\n本文",
      title: "タイトル",
      description: "説明文",
      meta: {
        type: "index-meta",
        icon: "📁",
        schema: {
          name: {
            type: "text" as const,
            required: true,
            title: "名前",
            description: "項目の名前",
            default: "",
          },
        },
      },
    },
    {
      name: { type: "text", required: true },
    },
    defaultTestConfig,
  )

  expect(value.body).toBe("# タイトル\n\n説明文\n\n本文")
  expect(value.title).toBe("タイトル")
  expect(value.description).toBe("説明文")
  expect(value.meta().icon).toBe("📁")
})

test("DocFileContentIndexValue - frontMatter getterが値オブジェクトを返す", () => {
  const value = new DocFileIndexContentValue(
    {
      type: "markdown-index",
      body: "",
      title: "",
      description: "",
      meta: {
        type: "index-meta",
        icon: "📁",
        schema: {
          name: {
            type: "text" as const,
            required: true,
            title: null,
            description: null,
            default: null,
          },
        },
      },
    },
    {
      name: { type: "text", required: true },
    },
    defaultTestConfig,
  )

  const frontMatter = value.meta()
  expect(frontMatter.value.type).toBe("index-meta")
  expect(frontMatter.icon).toBe("📁")
})

test("DocFileContentIndexValue - withTitleで新しいインスタンスを作成", () => {
  const value = new DocFileIndexContentValue(
    {
      type: "markdown-index",
      body: "# 古いタイトル\n\n説明文",
      title: "古いタイトル",
      description: "説明文",
      meta: {
        type: "index-meta",
        icon: "",
        schema: {
          name: {
            type: "text" as const,
            required: true,
            title: null,
            description: null,
            default: null,
          },
        },
      },
    },
    {
      name: { type: "text", required: true },
    },
    defaultTestConfig,
  )

  const newValue = value.withTitle("新しいタイトル")

  expect(newValue).not.toBe(value) // 新しいインスタンス
  expect(newValue.title).toBe("新しいタイトル")
  expect(newValue.body).toContain("# 新しいタイトル")
  expect(value.title).toBe("古いタイトル") // 元は変更されない
})

test("DocFileContentIndexValue - withDescriptionで新しいインスタンスを作成", () => {
  const value = new DocFileIndexContentValue(
    {
      type: "markdown-index",
      body: "# タイトル\n\n古い説明",
      title: "タイトル",
      description: "古い説明",
      meta: {
        type: "index-meta",
        icon: "",
        schema: {
          name: {
            type: "text" as const,
            required: true,
            title: null,
            description: null,
            default: null,
          },
        },
      },
    },
    {
      name: { type: "text", required: true },
    },
    defaultTestConfig,
  )

  const newValue = value.withDescription("新しい説明")

  expect(newValue).not.toBe(value)
  expect(newValue.description).toBe("新しい説明")
  expect(newValue.body).toContain("新しい説明")
})

test("DocFileContentIndexValue - withContentで新しいインスタンスを作成", () => {
  const value = new DocFileIndexContentValue(
    {
      type: "markdown-index",
      body: "古い内容",
      title: "タイトル",
      description: "説明",
      meta: {
        type: "index-meta",
        icon: "",
        schema: {
          name: {
            type: "text" as const,
            required: true,
            title: null,
            description: null,
            default: null,
          },
        },
      },
    },
    {
      name: { type: "text", required: true },
    },
    defaultTestConfig,
  )

  const newValue = value.withContent("新しい内容")

  expect(newValue).not.toBe(value)
  expect(newValue.body).toBe("新しい内容")
  // タイトルは新しい内容から解析される
  expect(newValue.title).toBe("")
  expect(newValue.description).toBe("")
})

test("DocFileContentIndexValue - withFrontMatterで新しいインスタンスを作成", () => {
  const value = new DocFileIndexContentValue(
    {
      type: "markdown-index",
      body: "# タイトル",
      title: "タイトル",
      description: "",
      meta: {
        type: "index-meta",
        icon: "📁",
        schema: {
          name: {
            type: "text" as const,
            required: true,
            title: null,
            description: null,
            default: null,
          },
        },
      },
    },
    {
      name: { type: "text", required: true },
    },
    defaultTestConfig,
  )

  const newFrontMatter = {
    type: "index-meta" as const,
    icon: "📂",
    schema: {
      name: {
        type: "text" as const,
        required: true,
        title: null,
        description: null,
        default: null,
      },
    },
  }

  const newValue = value.withMeta(newFrontMatter)

  expect(newValue).not.toBe(value)
  expect(newValue.meta().icon).toBe("📂")
  expect(value.meta().icon).toBe("📁") // 元は変更されない
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

  const value = DocFileIndexContentValue.fromMarkdown(
    markdown,
    {},
    defaultTestConfig,
  )

  expect(value.title).toBe("ドキュメントタイトル")
  expect(value.description).toBe("これは説明文です。")
  expect(value.body).toContain("# ドキュメントタイトル")
  expect(value.meta().icon).toBe("📁")
})

test("DocFileContentIndexValue - emptyでデフォルトコンテンツを生成", () => {
  const value = DocFileIndexContentValue.empty(
    "テストディレクトリ",
    {},
    defaultTestConfig,
  )

  expect(value.title).toBe("テストディレクトリ")
  expect(value.meta().icon).toBe("")
  expect(value.meta().schema().toJson()).toEqual({})
  expect(value.body).toContain("# テストディレクトリ")
})

test("DocFileContentIndexValue - toTextでFrontMatter付きテキストを生成", () => {
  const value = new DocFileIndexContentValue(
    {
      type: "markdown-index",
      body: "# タイトル\n\n本文",
      title: "タイトル",
      description: "",
      meta: {
        type: "index-meta",
        icon: "📁",
        schema: {
          name: {
            type: "text" as const,
            required: true,
            title: null,
            description: null,
            default: null,
          },
        },
      },
    },
    {
      name: { type: "text", required: true },
    },
    defaultTestConfig,
  )

  const text = value.toText()

  expect(text).toContain("---")
  expect(text).toContain("icon: 📁")
  expect(text).toContain("# タイトル")
  expect(text).toContain("本文")
})

test("DocFileContentIndexValue - toMarkdownTextでbodyのみのテキストを生成", () => {
  const value = new DocFileIndexContentValue(
    {
      type: "markdown-index",
      body: "既存の本文",
      title: "タイトル",
      description: "説明",
      meta: {
        type: "index-meta",
        icon: "",
        schema: {
          name: {
            type: "text" as const,
            required: true,
            title: null,
            description: null,
            default: null,
          },
        },
      },
    },
    {
      name: { type: "text", required: true },
    },
    defaultTestConfig,
  )

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
    meta: {
      type: "index-meta" as const,
      icon: "📁",
      schema: {
        name: {
          type: "text" as const,
          required: true,
          title: null,
          description: null,
          default: null,
        },
      },
    },
  }

  const value = new DocFileIndexContentValue(
    data,
    { name: { type: "text", required: true } },
    defaultTestConfig,
  )
  expect(value.toJson()).toEqual(data)
})
