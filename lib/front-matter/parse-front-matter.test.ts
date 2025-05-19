import { describe, expect, it } from "bun:test"
import { z } from "zod"
import { parseFrontMatter } from "./parse-front-matter"

describe("parseFrontMatter", () => {
  it("基本的なfront matterを解析できる", () => {
    const schema = z.object({
      title: z.string(),
      description: z.string(),
    })

    const text = `---
title: テストタイトル
description: テスト説明
---
本文コンテンツ`

    const result = parseFrontMatter({
      text,
      schema,
    })

    expect(result.data).toEqual({
      title: "テストタイトル",
      description: "テスト説明",
    })
    expect(result.content).toBe("本文コンテンツ")
  })

  it("空のfront matterも処理できる", () => {
    const schema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    })

    const text = `---
---
本文コンテンツのみ`

    const result = parseFrontMatter({
      text,
      schema,
    })

    expect(result.data).toEqual({})
    expect(result.content).toBe("本文コンテンツのみ")
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
本文コンテンツ`

    const result = parseFrontMatter({
      text,
      schema,
    })

    expect(result.data).toEqual({
      title: "配列テスト",
      tags: ["タグ1", "タグ2", "タグ3"],
    })
    expect(result.content).toBe("本文コンテンツ")
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
本文コンテンツ`

    const result = parseFrontMatter<SchemaType, typeof schema>({
      text,
      schema,
    })

    expect(result.data).toEqual({
      title: "テストタイトル",
      count: 42,
    })
    expect(result.content).toBe("本文コンテンツ")
  })
})
