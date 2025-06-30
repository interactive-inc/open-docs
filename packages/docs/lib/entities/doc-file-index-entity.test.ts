import { expect, test } from "bun:test"
import { DocFileContentIndexValue } from "../values/doc-file-content-index-value"
import { DocFileIndexEntity } from "./doc-file-index-entity"

test("DocFileIndexEntity - 基本的な作成とプロパティアクセス", () => {
  const entity = new DocFileIndexEntity({
    type: "index",
    content: {
      type: "markdown-index",
      body: "# タイトル\n\n説明文",
      title: "タイトル",
      description: "説明文",
      frontMatter: {
        type: "index-frontmatter",
        icon: "📁",
        schema: {},
      },
    },
    path: {
      path: "docs/index.md",
      name: "index",
      fullPath: "/Users/test/docs/index.md",
      nameWithExtension: "index.md",
    },
  })

  expect(entity.value.type).toBe("index")
})

test("DocFileIndexEntity - content getterが値オブジェクトを返す", () => {
  const entity = new DocFileIndexEntity({
    type: "index",
    content: {
      type: "markdown-index",
      body: "# タイトル",
      title: "タイトル",
      description: "",
      frontMatter: {
        type: "index-frontmatter",
        icon: "📁",
        schema: {},
      },
    },
    path: {
      path: "docs/index.md",
      name: "index",
      fullPath: "/Users/test/docs/index.md",
      nameWithExtension: "index.md",
    },
  })

  const content = entity.content
  expect(content).toBeInstanceOf(DocFileContentIndexValue)
  expect(content.title).toBe("タイトル")
  expect(content.body).toBe("# タイトル")
})

test("DocFileIndexEntity - path getterがオブジェクトを返す", () => {
  const entity = new DocFileIndexEntity({
    type: "index",
    content: {
      type: "markdown-index",
      body: "",
      title: "",
      description: "",
      frontMatter: {
        type: "index-frontmatter",
        icon: "",
        schema: {},
      },
    },
    path: {
      path: "docs/index.md",
      name: "index",
      fullPath: "/Users/test/docs/index.md",
      nameWithExtension: "index.md",
    },
  })

  const path = entity.path
  expect(path.name).toBe("index")
  expect(path.path).toBe("docs/index.md")
  expect(path.fullPath).toBe("/Users/test/docs/index.md")
  expect(path.nameWithExtension).toBe("index.md")
})

test("DocFileIndexEntity - withContentで新しいインスタンスを作成", () => {
  const entity = new DocFileIndexEntity({
    type: "index",
    content: {
      type: "markdown-index",
      body: "# 古いタイトル",
      title: "古いタイトル",
      description: "",
      frontMatter: {
        type: "index-frontmatter",
        icon: "📁",
        schema: {},
      },
    },
    path: {
      path: "docs/index.md",
      name: "index",
      fullPath: "/Users/test/docs/index.md",
      nameWithExtension: "index.md",
    },
  })

  const newContent = entity.content.withTitle("新しいタイトル")
  const newEntity = entity.withContent(newContent)

  expect(newEntity).not.toBe(entity) // 新しいインスタンス
  expect(newEntity.content.title).toBe("新しいタイトル")
  expect(entity.content.title).toBe("古いタイトル") // 元は変更されない
})

test("DocFileIndexEntity - withPathで新しいインスタンスを作成", () => {
  const entity = new DocFileIndexEntity({
    type: "index",
    content: {
      type: "markdown-index",
      body: "",
      title: "",
      description: "",
      frontMatter: {
        type: "index-frontmatter",
        icon: "",
        schema: {},
      },
    },
    path: {
      path: "docs/index.md",
      name: "index",
      fullPath: "/Users/test/docs/index.md",
      nameWithExtension: "index.md",
    },
  })

  const newPath = {
    path: "docs/new-index.md",
    name: "new-index",
    fullPath: "/Users/test/docs/new-index.md",
    nameWithExtension: "new-index.md",
  }
  const newEntity = entity.withPath(newPath)

  expect(newEntity).not.toBe(entity) // 新しいインスタンス
  expect(newEntity.path.path).toBe("docs/new-index.md")
  expect(entity.path.path).toBe("docs/index.md") // 元は変更されない
})

test("DocFileIndexEntity - toJsonで元のデータ構造を返す", () => {
  const data = {
    type: "index" as const,
    content: {
      type: "markdown-index" as const,
      body: "# タイトル",
      title: "タイトル",
      description: "説明",
      frontMatter: {
        type: "index-frontmatter" as const,
        icon: "📁",
        schema: {},
      },
    },
    path: {
      path: "docs/index.md",
      name: "index",
      fullPath: "/Users/test/docs/index.md",
      nameWithExtension: "index.md",
    },
  }

  const entity = new DocFileIndexEntity(data)
  expect(entity.toJson()).toEqual(data)
})

test("DocFileIndexEntity - 不変性の確認", () => {
  const entity = new DocFileIndexEntity({
    type: "index",
    content: {
      type: "markdown-index",
      body: "",
      title: "",
      description: "",
      frontMatter: {
        type: "index-frontmatter",
        icon: "",
        schema: {},
      },
    },
    path: {
      path: "docs/index.md",
      name: "index",
      fullPath: "/Users/test/docs/index.md",
      nameWithExtension: "index.md",
    },
  })

  expect(() => {
    // @ts-expect-error - 不変性のテスト
    entity.value = {}
  }).toThrow()
})
