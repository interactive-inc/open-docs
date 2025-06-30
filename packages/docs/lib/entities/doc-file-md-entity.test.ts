import { expect, test } from "bun:test"
import { DocFileContentMdValue } from "../values/doc-file-content-md-value"
import { DocFileMdEntity } from "./doc-file-md-entity"

test("DocFileMdEntity - 基本的な作成とプロパティアクセス", () => {
  const entity = new DocFileMdEntity({
    type: "markdown",
    content: {
      type: "markdown-content",
      body: "# タイトル\n\n説明文\n\n本文",
      title: "タイトル",
      description: "説明文",
      frontMatter: {
        title: "メタタイトル",
        tags: ["tag1", "tag2"],
      },
    },
    path: {
      path: "docs/example.md",
      name: "example",
      fullPath: "/Users/test/docs/example.md",
      nameWithExtension: "example.md",
    },
    isArchived: false,
  })

  expect(entity.value.type).toBe("markdown")
  expect(entity.value.isArchived).toBe(false)
})

test("DocFileMdEntity - content getterが値オブジェクトを返す", () => {
  const entity = new DocFileMdEntity({
    type: "markdown",
    content: {
      type: "markdown-content",
      body: "# タイトル\n\n説明文",
      title: "タイトル",
      description: "説明文",
      frontMatter: {
        author: "テスト作者",
      },
    },
    path: {
      path: "docs/test.md",
      name: "test",
      fullPath: "/Users/test/docs/test.md",
      nameWithExtension: "test.md",
    },
    isArchived: false,
  })

  const content = entity.content
  expect(content).toBeInstanceOf(DocFileContentMdValue)
  expect(content.title).toBe("タイトル")
  expect(content.description).toBe("説明文")
  expect(content.body).toBe("# タイトル\n\n説明文")
})

test("DocFileMdEntity - path getterが値オブジェクトを返す", () => {
  const entity = new DocFileMdEntity({
    type: "markdown",
    content: {
      type: "markdown-content",
      body: "",
      title: "",
      description: "",
      frontMatter: {},
    },
    path: {
      path: "docs/test.md",
      name: "test",
      fullPath: "/Users/test/docs/test.md",
      nameWithExtension: "test.md",
    },
    isArchived: false,
  })

  const path = entity.path
  expect(path.name).toBe("test")
  expect(path.path).toBe("docs/test.md")
  expect(path.fullPath).toBe("/Users/test/docs/test.md")
  expect(path.nameWithExtension).toBe("test.md")
})

test("DocFileMdEntity - withContentで新しいインスタンスを作成", () => {
  const entity = new DocFileMdEntity({
    type: "markdown",
    content: {
      type: "markdown-content",
      body: "# 古いタイトル",
      title: "古いタイトル",
      description: "",
      frontMatter: {},
    },
    path: {
      path: "docs/test.md",
      name: "test",
      fullPath: "/Users/test/docs/test.md",
      nameWithExtension: "test.md",
    },
    isArchived: false,
  })

  const newContent = entity.content.withTitle("新しいタイトル")
  const newEntity = entity.withContent(newContent)

  expect(newEntity).not.toBe(entity) // 新しいインスタンス
  expect(newEntity.content.title).toBe("新しいタイトル")
  expect(entity.content.title).toBe("古いタイトル") // 元は変更されない
})

test("DocFileMdEntity - withPathで新しいインスタンスを作成", () => {
  const entity = new DocFileMdEntity({
    type: "markdown",
    content: {
      type: "markdown-content",
      body: "",
      title: "",
      description: "",
      frontMatter: {},
    },
    path: {
      path: "docs/old.md",
      name: "old",
      fullPath: "/Users/test/docs/old.md",
      nameWithExtension: "old.md",
    },
    isArchived: false,
  })

  const newPath = {
    path: "docs/new.md",
    name: "new",
    fullPath: "/Users/test/docs/new.md",
    nameWithExtension: "new.md",
  }
  const newEntity = entity.withPath(newPath)

  expect(newEntity).not.toBe(entity) // 新しいインスタンス
  expect(newEntity.path.path).toBe("docs/new.md")
  expect(newEntity.path.name).toBe("new")
  expect(entity.path.path).toBe("docs/old.md") // 元は変更されない
})

test("DocFileMdEntity - toJsonで元のデータ構造を返す", () => {
  const data = {
    type: "markdown" as const,
    content: {
      type: "markdown-content" as const,
      body: "# タイトル\n\n本文",
      title: "タイトル",
      description: "説明",
      frontMatter: {
        date: "2024-01-01",
        author: "作者",
      },
    },
    path: {
      path: "docs/test.md",
      name: "test",
      fullPath: "/Users/test/docs/test.md",
      nameWithExtension: "test.md",
    },
    isArchived: false,
  }

  const entity = new DocFileMdEntity(data)
  expect(entity.toJson()).toEqual(data)
})

test("DocFileMdEntity - 不変性の確認", () => {
  const entity = new DocFileMdEntity({
    type: "markdown",
    content: {
      type: "markdown-content",
      body: "",
      title: "",
      description: "",
      frontMatter: {},
    },
    path: {
      path: "docs/test.md",
      name: "test",
      fullPath: "/Users/test/docs/test.md",
      nameWithExtension: "test.md",
    },
    isArchived: false,
  })

  expect(() => {
    // @ts-expect-error - 不変性のテスト
    entity.value = {}
  }).toThrow()
})
