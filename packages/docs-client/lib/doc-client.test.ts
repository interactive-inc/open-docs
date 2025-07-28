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
