import { describe, expect, it } from "bun:test"
import { parseMarkdown } from "./parse-markdown"

describe("parseMarkdown", () => {
  it("フロントマターがある場合は正しく抽出する", () => {
    const text = `---
title: テスト
description: 説明文
---
# テストコンテンツ

本文のコンテンツです。
複数行のテキストです。`

    const result = parseMarkdown(text)

    expect(result.frontMatter).toEqual({
      title: "テスト",
      description: "説明文",
    })
    expect(result.content).toBe(
      "# テストコンテンツ\n\n本文のコンテンツです。\n複数行のテキストです。",
    )
    expect(result.title).toBe("テストコンテンツ")
  })

  it("フロントマターがない場合はnullを返す", () => {
    const text = "# 見出し\nフロントマターのない普通のテキスト"

    const result = parseMarkdown(text)

    expect(result.frontMatter).toBeNull()
    expect(result.content).toBe("# 見出し\nフロントマターのない普通のテキスト")
    expect(result.title).toBe("見出し")
  })

  it("最初の行が---でもフロントマターの終わりがない場合はnullを返す", () => {
    const text = `---
title: テスト
description: 説明文
# 見出し
フロントマターの終わりがない`

    const result = parseMarkdown(text)

    expect(result.frontMatter).toBeNull()
    expect(result.content).toBe(text)
    expect(result.title).toBe("見出し")
  })

  it("空のフロントマターを処理できる", () => {
    const text = `---
---
# 見出し
コンテンツ部分`

    const result = parseMarkdown(text)

    expect(result.frontMatter).toEqual({})
    expect(result.content).toBe("# 見出し\nコンテンツ部分")
    expect(result.title).toBe("見出し")
  })

  it("フロントマターの後に空行がある場合も処理できる", () => {
    const text = `---
title: テスト
---

# 見出し
コンテンツ部分`

    const result = parseMarkdown(text)

    expect(result.frontMatter).toEqual({
      title: "テスト",
    })
    expect(result.content).toBe("# 見出し\nコンテンツ部分")
    expect(result.title).toBe("見出し")
  })
})
