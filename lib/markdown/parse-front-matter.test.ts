import { describe, expect, it } from "bun:test"
import { z } from "zod"
import { parseMarkdown } from "./parse-markdown"

describe("フロントマターのスキーマによる検証", () => {
  it("基本的なfront matterを解析できる", () => {
    const schema = z.object({
      title: z.string(),
      description: z.string(),
    })

    const text = `---
title: テストタイトル
description: テスト説明
---
# 見出し
本文コンテンツ`

    const markdown = parseMarkdown(text)
    const data = schema.parse(markdown.frontMatter)

    expect(data).toEqual({
      title: "テストタイトル",
      description: "テスト説明",
    })
    expect(markdown.content).toBe("# 見出し\n本文コンテンツ")
    expect(markdown.title).toBe("見出し")
  })

  it("空のfront matterも処理できる", () => {
    const schema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    })

    const text = `---
---
# 見出し
本文コンテンツのみ`

    const markdown = parseMarkdown(text)
    const data = schema.parse(markdown.frontMatter)

    expect(data).toEqual({})
    expect(markdown.content).toBe("# 見出し\n本文コンテンツのみ")
    expect(markdown.title).toBe("見出し")
  })

  it("配列値を含むfront matterを処理できる", () => {
    const schema = z.object({
      title: z.string(),
      tags: z.array(z.string()),
    })

    const text = `---
title: 配列テスト
tags:
- タグ1
- タグ2
- タグ3
---
# 見出し
本文コンテンツ`

    const markdown = parseMarkdown(text)
    const data = schema.parse(markdown.frontMatter)

    expect(data).toEqual({
      title: "配列テスト",
      tags: ["タグ1", "タグ2", "タグ3"],
    })
    expect(markdown.content).toBe("# 見出し\n本文コンテンツ")
    expect(markdown.title).toBe("見出し")
  })

  it("型変換を含むスキーマでも正しく動作する", () => {
    // スキーマの型を明示的に定義
    const schema = z.object({
      title: z.string(),
      count: z.string().transform((val) => Number.parseInt(val, 10)),
    })

    // スキーマから推論される型を使用
    type SchemaType = z.infer<typeof schema>

    const text = `---
title: テストタイトル
count: 42
---
# 見出し
本文コンテンツ`

    const markdown = parseMarkdown(text)
    const data = schema.parse(markdown.frontMatter) as SchemaType

    expect(data).toEqual({
      title: "テストタイトル",
      count: 42,
    })
    expect(markdown.content).toBe("# 見出し\n本文コンテンツ")
    expect(markdown.title).toBe("見出し")
  })
})
