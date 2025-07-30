import { expect, test } from "bun:test"
import { DocClient } from "./doc-client"
import { DocFileSystem } from "./doc-file-system"
import { DocMarkdownSystem } from "./doc-markdown-system"
import { DocPathSystem } from "./doc-path-system"

test("DocClient - デフォルト値でインスタンスを作成", () => {
  const pathSystem = new DocPathSystem()
  const fileSystem = new DocFileSystem({ basePath: "/test", pathSystem })
  const client = new DocClient({ fileSystem })

  expect(client.fileSystem).toBe(fileSystem)
  expect(client.pathSystem).toBeInstanceOf(DocPathSystem)
  expect(client.markdownSystem).toBeInstanceOf(DocMarkdownSystem)
  expect(client.config.indexFileName).toBe("index.md")
  expect(client.config.archiveDirectoryName).toBe("_")
})

test("DocClient - カスタム値でインスタンスを作成", () => {
  const pathSystem = new DocPathSystem()
  const fileSystem = new DocFileSystem({ basePath: "/test", pathSystem })
  const markdownSystem = new DocMarkdownSystem()

  const client = new DocClient({
    fileSystem,
    pathSystem,
    markdownSystem,
    config: {
      defaultIndexIcon: "📃",
      indexFileName: "README.md",
      archiveDirectoryName: ".archive",
      defaultDirectoryName: "Directory",
      indexMetaIncludes: [],
      directoryExcludes: [".vitepress"],
    },
  })

  expect(client.fileSystem).toBe(fileSystem)
  expect(client.pathSystem).toBe(pathSystem)
  expect(client.markdownSystem).toBe(markdownSystem)
  expect(client.config.indexFileName).toBe("README.md")
  expect(client.config.archiveDirectoryName).toBe(".archive")
})

test("DocClient - basePathを取得", () => {
  const pathSystem = new DocPathSystem()
  const fileSystem = new DocFileSystem({ basePath: "/test/docs", pathSystem })
  const client = new DocClient({ fileSystem })

  expect(client.basePath()).toBe("/test/docs")
})

test("DocClient - mdFileで.md拡張子を自動補完", () => {
  const pathSystem = new DocPathSystem()
  const fileSystem = new DocFileSystem({ basePath: "/test", pathSystem })
  const client = new DocClient({ fileSystem })

  // .md拡張子がない場合は自動で補完される
  const fileWithoutExt = client.mdFile("foo")
  expect(fileWithoutExt.path).toBe("foo.md")

  // .md拡張子がある場合はそのまま
  const fileWithExt = client.mdFile("bar.md")
  expect(fileWithExt.path).toBe("bar.md")
})

test("DocClient - file()メソッドが自動的にファイルタイプを判定", () => {
  const pathSystem = new DocPathSystem()
  const fileSystem = new DocFileSystem({ basePath: "/test", pathSystem })
  const client = new DocClient({ fileSystem })

  // index.mdを判定
  const indexRef = client.file("docs/index.md")
  expect(indexRef.constructor.name).toBe("DocFileIndexReference")

  // 通常のmarkdownファイルを判定
  const mdRef = client.file("docs/guide.md")
  expect(mdRef.constructor.name).toBe("DocFileMdReference")

  // 不明なファイルタイプを判定
  const unknownRef = client.file("docs/data.json")
  expect(unknownRef.constructor.name).toBe("DocFileUnknownReference")
})

test("DocClient - file()メソッドがサブディレクトリのindex.mdを正しく判定", () => {
  const pathSystem = new DocPathSystem()
  const fileSystem = new DocFileSystem({ basePath: "/test", pathSystem })
  const client = new DocClient({ fileSystem })

  const indexRef = client.file("docs/posts/index.md")
  expect(indexRef.constructor.name).toBe("DocFileIndexReference")
})

test("DocClient - file()メソッドがカスタムスキーマを受け取る", () => {
  const pathSystem = new DocPathSystem()
  const fileSystem = new DocFileSystem({ basePath: "/test", pathSystem })
  const client = new DocClient({ fileSystem })

  const schema = {
    title: { type: "text" as const },
  }

  const indexRef = client.file("docs/index.md", schema)
  expect(indexRef.constructor.name).toBe("DocFileIndexReference")

  const mdRef = client.file("docs/guide.md", schema)
  expect(mdRef.constructor.name).toBe("DocFileMdReference")
})
