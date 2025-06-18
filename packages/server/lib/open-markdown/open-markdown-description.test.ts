import { describe, expect, test } from "bun:test"
import { OpenMarkdown } from "./open-markdown"

describe("OpenMarkdown description functionality", () => {
  test("should extract description from paragraph after H1", () => {
    const markdown = `# タイトル

これがdescriptionになる段落です。

## 次の見出し`

    const openMarkdown = new OpenMarkdown(markdown)
    expect(openMarkdown.description).toBe("これがdescriptionになる段落です。")
  })

  test("should return first paragraph when no H1 exists", () => {
    const markdown = `これは普通の段落です。

## 見出し2`

    const openMarkdown = new OpenMarkdown(markdown)
    expect(openMarkdown.description).toBe("これは普通の段落です。")
  })

  test("should return null when no paragraph follows H1", () => {
    const markdown = `# タイトル

## 次の見出し`

    const openMarkdown = new OpenMarkdown(markdown)
    expect(openMarkdown.description).toBeNull()
  })

  test("should handle multi-line paragraphs", () => {
    const markdown = `# タイトル

これは複数行の
description段落です。
改行を含んでいます。

## 次の見出し`

    const openMarkdown = new OpenMarkdown(markdown)
    expect(openMarkdown.description).toBe(
      "これは複数行の\ndescription段落です。\n改行を含んでいます。",
    )
  })

  test("should stop at lists", () => {
    const markdown = `# タイトル

これがdescription段落です。

- リスト項目1
- リスト項目2`

    const openMarkdown = new OpenMarkdown(markdown)
    expect(openMarkdown.description).toBe("これがdescription段落です。")
  })

  test("should stop at numbered lists", () => {
    const markdown = `# タイトル

これがdescription段落です。

1. 番号付きリスト1
2. 番号付きリスト2`

    const openMarkdown = new OpenMarkdown(markdown)
    expect(openMarkdown.description).toBe("これがdescription段落です。")
  })

  test("should handle empty lines after H1", () => {
    const markdown = `# タイトル



これがdescription段落です。`

    const openMarkdown = new OpenMarkdown(markdown)
    expect(openMarkdown.description).toBe("これがdescription段落です。")
  })

  test("should update existing description paragraph", () => {
    const markdown = `# タイトル

古いdescription段落です。

## 次の見出し`

    const openMarkdown = new OpenMarkdown(markdown)
    const updated = openMarkdown.withDescription("新しいdescription段落です。")

    expect(updated.description).toBe("新しいdescription段落です。")
    expect(updated.text).toContain("新しいdescription段落です。")
    expect(updated.text).not.toContain("古いdescription段落です。")
  })

  test("should add description when none exists", () => {
    const markdown = `# タイトル

## 次の見出し`

    const openMarkdown = new OpenMarkdown(markdown)
    const updated = openMarkdown.withDescription("新しいdescription段落です。")

    expect(updated.description).toBe("新しいdescription段落です。")
    expect(updated.text).toContain("新しいdescription段落です。")
  })

  test("should preserve frontmatter when updating description", () => {
    const markdown = `---
title: "Test"
schema: {}
---

# タイトル

古いdescription段落です。

## 次の見出し`

    const openMarkdown = new OpenMarkdown(markdown)
    const updated = openMarkdown.withDescription("新しいdescription段落です。")

    expect(updated.frontMatter.data?.title).toBe("Test")
    expect(updated.description).toBe("新しいdescription段落です。")
  })

  test("should not add excessive newlines when updating", () => {
    const markdown = `# タイトル

古いdescription段落です。


## 次の見出し

本文内容です。`

    const openMarkdown = new OpenMarkdown(markdown)
    const updated = openMarkdown.withDescription("新しいdescription段落です。")

    // 結果が適切にフォーマットされていることを確認
    expect(updated.text).toBe(`# タイトル

新しいdescription段落です。

## 次の見出し

本文内容です。`)

    // 連続する空行が制御されていることを確認
    expect(updated.text).not.toContain("\n\n\n")
  })

  test("should add H1 with default title when H1 does not exist", () => {
    const markdown = `これは本文の内容です。

## 次の見出し`

    const openMarkdown = new OpenMarkdown(markdown)
    const updated = openMarkdown.withDescription(
      "新しいdescription段落です。",
      "デフォルトタイトル",
    )

    expect(updated.title).toBe("デフォルトタイトル")
    expect(updated.description).toBe("新しいdescription段落です。")
    // 元のdescriptionは「これは本文の内容です。」なので、それが新しいdescriptionに置き換わる
    expect(updated.text).toBe(`# デフォルトタイトル

新しいdescription段落です。

## 次の見出し`)
  })

  test("should handle content with multiple consecutive newlines", () => {
    const markdown = `# タイトル




古いdescription段落です。




## 次の見出し




本文内容です。`

    const openMarkdown = new OpenMarkdown(markdown)
    const updated = openMarkdown.withTitle("新しいタイトル")

    // 不要な改行が削除されることを確認
    expect(updated.text).toBe(`# 新しいタイトル

古いdescription段落です。

## 次の見出し




本文内容です。`)
  })

  test("should extract description from content without H1", () => {
    const markdown = `このディレクトリには、在庫管理システムの各機能要件を定義するファイルが含まれています。

## ファイル一覧

- add-inventory.md - 入庫処理を行う`

    const openMarkdown = new OpenMarkdown(markdown)
    expect(openMarkdown.description).toBe(
      "このディレクトリには、在庫管理システムの各機能要件を定義するファイルが含まれています。",
    )
  })

  test("should extract multi-line description from content without H1", () => {
    const markdown = `これは複数行の
説明文です。
改行を含んでいます。

## 次の見出し`

    const openMarkdown = new OpenMarkdown(markdown)
    expect(openMarkdown.description).toBe(
      "これは複数行の\n説明文です。\n改行を含んでいます。",
    )
  })

  test("should update description without H1 and add default title", () => {
    const markdown = `このディレクトリには、在庫管理システムの各機能要件を定義するファイルが含まれています。

## ファイル一覧

- add-inventory.md - 入庫処理を行う`

    const openMarkdown = new OpenMarkdown(markdown)
    const updated = openMarkdown.withDescription(
      "新しい説明文です。",
      "features",
    )

    expect(updated.title).toBe("features")
    expect(updated.description).toBe("新しい説明文です。")
    expect(updated.text).toBe(`# features

新しい説明文です。

## ファイル一覧

- add-inventory.md - 入庫処理を行う`)
  })

  test("should not duplicate description when updating without H1", () => {
    const markdown = `---
icon: 🐈
schema:
  milestone:
    type: string
---

このディレクトリには、在庫管理システムの各機能要件を定義するファイルが含まれています。

## ファイル一覧`

    const openMarkdown = new OpenMarkdown(markdown)
    const updated = openMarkdown.withDescription(
      "更新された説明文です。",
      "features",
    )

    expect(updated.text).toContain("# features")
    expect(updated.text).toContain("更新された説明文です。")
    expect(updated.text).not.toContain(
      "このディレクトリには、在庫管理システムの各機能要件を定義するファイルが含まれています。",
    )
    expect(updated.text).toContain("## ファイル一覧")
  })
})
