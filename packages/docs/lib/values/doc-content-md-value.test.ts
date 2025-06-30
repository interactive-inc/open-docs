import { describe, expect, it } from "bun:test"
import { z } from "zod/v4"
import { DocContentMdValue } from "./doc-content-md-value"

describe("parseMarkdown", () => {
  it("フロントマターがある場合は正しく抽出する", () => {
    const text = `---
title: テストタイトル
description: テスト説明
---
# 見出し
本文コンテンツ`

    const openMarkdown = new DocContentMdValue(text)

    expect(openMarkdown.frontMatter.data).toEqual({
      title: "テストタイトル",
      description: "テスト説明",
    })
    expect(openMarkdown.content).toBe("# 見出し\n本文コンテンツ")
    expect(openMarkdown.title).toBe("見出し")
  })

  it("フロントマターがない場合はnullを返す", () => {
    const text = `# 見出し
本文コンテンツ`

    const openMarkdown = new DocContentMdValue(text)

    expect(openMarkdown.frontMatter.data).toBeNull()
    expect(openMarkdown.content).toBe("# 見出し\n本文コンテンツ")
    expect(openMarkdown.title).toBe("見出し")
  })

  it("最初の行が---でもフロントマターの終わりがない場合はnullを返す", () => {
    const text = `---
ここには終わりがない
# 見出し
本文コンテンツ`

    const openMarkdown = new DocContentMdValue(text)

    expect(openMarkdown.frontMatter.data).toBeNull()
    expect(openMarkdown.content).toContain("---")
  })

  it("空のフロントマターを処理できる", () => {
    const text = `---
---
# 見出し
コンテンツ部分`

    const openMarkdown = new DocContentMdValue(text)

    expect(openMarkdown.frontMatter.data).toEqual({})
    expect(openMarkdown.content).toBe("# 見出し\nコンテンツ部分")
    expect(openMarkdown.title).toBe("見出し")
  })

  it("フロントマターの後に空行がある場合も処理できる", () => {
    const text = `---
title: テストタイトル
---

# 見出し
本文コンテンツ`

    const openMarkdown = new DocContentMdValue(text)

    expect(openMarkdown.frontMatter.data).toEqual({ title: "テストタイトル" })
    expect(openMarkdown.content).toBe("# 見出し\n本文コンテンツ")
    expect(openMarkdown.title).toBe("見出し")
  })
})

describe("OpenMarkdown instance", () => {
  it("基本的なfront matterを解析できる", () => {
    const text = `---
title: テストタイトル
description: テスト説明
---
# 見出し
本文コンテンツ`

    const openMarkdown = new DocContentMdValue(text)
    expect(openMarkdown.frontMatter.data).toEqual({
      title: "テストタイトル",
      description: "テスト説明",
    })
    expect(openMarkdown.content).toBe("# 見出し\n本文コンテンツ")
    expect(openMarkdown.title).toBe("見出し")
  })

  it("空のfront matterも処理できる", () => {
    const text = `---
---
# 見出し
本文コンテンツ`

    const openMarkdown = new DocContentMdValue(text)
    expect(openMarkdown.frontMatter.data).toEqual({})
    expect(openMarkdown.content).toBe("# 見出し\n本文コンテンツ")
    expect(openMarkdown.title).toBe("見出し")
  })

  it("配列値を含むfront matterを処理できる", () => {
    const text = `---
title: テストタイトル
tags:
- タグ1
- タグ2
- タグ3
---
# 見出し
本文コンテンツ`

    const openMarkdown = new DocContentMdValue(text)
    expect(openMarkdown.frontMatter.data).toEqual({
      title: "テストタイトル",
      tags: ["タグ1", "タグ2", "タグ3"],
    })
    expect(openMarkdown.content).toBe("# 見出し\n本文コンテンツ")
    expect(openMarkdown.title).toBe("見出し")
  })

  it("型変換を含むスキーマでも正しく動作する", () => {
    // スキーマの型を明示的に定義
    const schema = z.object({
      title: z.string(),
      count: z.number().transform((val) => val * 2),
    })

    // スキーマから推論される型を使用
    type SchemaType = z.infer<typeof schema>

    const text = `---
title: テストタイトル
count: 42
---
# 見出し
本文コンテンツ`

    const openMarkdown = new DocContentMdValue(text)
    const data = schema.parse(openMarkdown.frontMatter.data) as SchemaType

    expect(data).toEqual({
      title: "テストタイトル",
      count: 84,
    })
    expect(openMarkdown.content).toBe("# 見出し\n本文コンテンツ")
    expect(openMarkdown.title).toBe("見出し")
  })

  it("fromPropsメソッドでMarkdownテキストを生成できる", () => {
    const text = `---
title: テストタイトル
---
# 見出し
本文コンテンツ`

    const openMarkdown = new DocContentMdValue(text)
    const generatedMarkdown = DocContentMdValue.fromProps({
      frontMatter: openMarkdown.frontMatter.data || {},
      content: openMarkdown.content,
    })

    expect(generatedMarkdown.text).toContain("title: テストタイトル")
    expect(generatedMarkdown.text).toContain("# 見出し")
    expect(generatedMarkdown.text).toContain("本文コンテンツ")
  })

  it("updateFrontMatterメソッドでフロントマターを更新できる", () => {
    const text = `---
title: テストタイトル
---
# 見出し
本文コンテンツ`

    const openMarkdown = new DocContentMdValue(text)
    const updatedText = openMarkdown.updateFrontMatter({
      title: "更新されたタイトル",
      description: "新しい説明",
    })

    expect(updatedText).toContain("title: 更新されたタイトル")
    expect(updatedText).toContain("description: 新しい説明")
    expect(updatedText).toContain("# 見出し")
    expect(updatedText).toContain("本文コンテンツ")
  })

  it("frontMatter.yamlTextでフロントマターYAMLテキストを取得できる", () => {
    const text = `---
title: テストタイトル
description: テスト説明
tags:
  - tag1
  - tag2
---
# 見出し
本文コンテンツ`

    const openMarkdown = new DocContentMdValue(text)

    expect(openMarkdown.frontMatter.yamlText).toBe(`title: テストタイトル
description: テスト説明
tags:
  - tag1
  - tag2`)
  })

  it("フロントマターがない場合frontMatter.yamlTextは空文字", () => {
    const text = `# 見出し
本文コンテンツ`

    const openMarkdown = new DocContentMdValue(text)

    expect(openMarkdown.frontMatter.yamlText).toBe("")
  })
})
