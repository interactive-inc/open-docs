import { describe, expect, it } from "bun:test"
import { extractFrontMatterText } from "./extract-front-matter-text"

describe("extractFrontMatterText", () => {
  it("フロントマターがある場合は正しく抽出する", () => {
    const text = `---
title: テスト
description: 説明文
---
本文のコンテンツです。
複数行のテキストです。`

    const result = extractFrontMatterText(text)

    expect(result.frontMatterText).toBe("title: テスト\ndescription: 説明文")
    expect(result.contentText).toBe(
      "本文のコンテンツです。\n複数行のテキストです。",
    )
  })

  it("フロントマターがない場合はnullを返す", () => {
    const text = "フロントマターのない普通のテキスト"

    const result = extractFrontMatterText(text)

    expect(result.frontMatterText).toBeNull()
    expect(result.contentText).toBe("フロントマターのない普通のテキスト")
  })

  it("最初の行が---でもフロントマターの終わりがない場合はnullを返す", () => {
    const text = `---
title: テスト
description: 説明文
フロントマターの終わりがない`

    const result = extractFrontMatterText(text)

    expect(result.frontMatterText).toBeNull()
    expect(result.contentText).toBe(text)
  })

  it("空のフロントマターを処理できる", () => {
    const text = `---
---
コンテンツ部分`

    const result = extractFrontMatterText(text)

    expect(result.frontMatterText).toBe("")
    expect(result.contentText).toBe("コンテンツ部分")
  })

  it("フロントマターの後に空行がある場合も処理できる", () => {
    const text = `---
title: テスト
---

コンテンツ部分`

    const result = extractFrontMatterText(text)

    expect(result.frontMatterText).toBe("title: テスト")
    expect(result.contentText).toBe("コンテンツ部分")
  })
})
