import { describe, expect, it } from "bun:test"
import { parseFrontMatterContent } from "./parse-front-matter-content"

describe("parseFrontMatterContent", () => {
  it("空の文字列の場合は空のオブジェクトを返す", () => {
    const result = parseFrontMatterContent("")
    expect(result).toEqual({})
  })

  it("シンプルなキーと値のペアを正しくパースする", () => {
    const frontMatterText = `title: タイトル
description: 説明文
version: 1.0`

    const result = parseFrontMatterContent(frontMatterText)

    expect(result).toEqual({
      title: "タイトル",
      description: "説明文",
      version: "1.0",
    })
  })

  it("配列形式のデータを正しくパースする", () => {
    const frontMatterText = `tags:
- タグ1
- タグ2
- タグ3`

    const result = parseFrontMatterContent(frontMatterText)

    expect(result).toEqual({
      tags: ["タグ1", "タグ2", "タグ3"],
    })
  })

  it("通常の値と配列が混在する場合も正しくパースする", () => {
    const frontMatterText = `title: タイトル
tags:
- タグ1
- タグ2
author: 作者名`

    const result = parseFrontMatterContent(frontMatterText)

    expect(result).toEqual({
      title: "タイトル",
      tags: ["タグ1", "タグ2"],
      author: "作者名",
    })
  })

  it("空行を無視する", () => {
    const frontMatterText = `title: タイトル

tags:
- タグ1

- タグ2
author: 作者名`

    const result = parseFrontMatterContent(frontMatterText)

    expect(result).toEqual({
      title: "タイトル",
      tags: ["タグ1", "タグ2"],
      author: "作者名",
    })
  })

  it("コロンを含まない行は無視する", () => {
    const frontMatterText = `title: タイトル
これは無視される
description: 説明文`

    const result = parseFrontMatterContent(frontMatterText)

    expect(result).toEqual({
      title: "タイトル",
      description: "説明文",
    })
  })

  it("配列モードでないときにハイフンで始まる行は無視する", () => {
    const frontMatterText = `title: タイトル
- これは無視される
description: 説明文`

    const result = parseFrontMatterContent(frontMatterText)

    expect(result).toEqual({
      title: "タイトル",
      description: "説明文",
    })
  })
})
