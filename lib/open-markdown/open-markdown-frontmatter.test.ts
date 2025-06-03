import { describe, expect, it } from "bun:test"
import { OpenMarkdownFrontmatter } from "./open-markdown-frontmatter"

describe("OpenMarkdownFrontmatter", () => {
  describe("fromMarkdown", () => {
    it("Markdownテキストからフロントマターを抽出できる", () => {
      const markdown = `---
title: テストタイトル
description: テスト説明
tags:
  - tag1
  - tag2
---
# 見出し
本文コンテンツ`

      const frontMatter = OpenMarkdownFrontmatter.fromMarkdown(markdown)

      expect(frontMatter.data).toEqual({
        title: "テストタイトル",
        description: "テスト説明",
        tags: ["tag1", "tag2"],
      })
      expect(frontMatter.yamlText).toBe(`title: テストタイトル
description: テスト説明
tags:
  - tag1
  - tag2`)
    })

    it("フロントマターがない場合は空のインスタンスを返す", () => {
      const markdown = `# 見出し
本文コンテンツ`

      const frontMatter = OpenMarkdownFrontmatter.fromMarkdown(markdown)

      expect(frontMatter.data).toBeNull()
      expect(frontMatter.yamlText).toBe("")
    })

    it("フロントマターの終わりがない場合は空のインスタンスを返す", () => {
      const markdown = `---
title: テストタイトル
# 見出し
本文コンテンツ`

      const frontMatter = OpenMarkdownFrontmatter.fromMarkdown(markdown)

      expect(frontMatter.data).toBeNull()
      expect(frontMatter.yamlText).toBe("")
    })

    it("空のフロントマターも正しく処理する", () => {
      const markdown = `---
---
# 見出し
本文コンテンツ`

      const frontMatter = OpenMarkdownFrontmatter.fromMarkdown(markdown)

      expect(frontMatter.data).toEqual({})
      expect(frontMatter.yamlText).toBe("")
    })
  })

  describe("update", () => {
    it("更新後もyamlTextが保持される", () => {
      const frontMatter = OpenMarkdownFrontmatter.fromFrontMatter({
        title: "元のタイトル",
        description: "元の説明",
      })

      const updated = frontMatter.update({
        title: "新しいタイトル",
        newField: "新しいフィールド",
      })

      expect(updated.data).toEqual({
        title: "新しいタイトル",
        description: "元の説明",
        newField: "新しいフィールド",
      })
      expect(updated.yamlText).toContain("title: 新しいタイトル")
      expect(updated.yamlText).toContain("description: 元の説明")
      expect(updated.yamlText).toContain("newField: 新しいフィールド")
    })
  })
})
