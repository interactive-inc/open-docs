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
  expect(client.indexFileName).toBe("index.md")
  expect(client.archiveDirectoryName).toBe("_")
})

test("DocClient - カスタム値でインスタンスを作成", () => {
  const pathSystem = new DocPathSystem()
  const fileSystem = new DocFileSystem({ basePath: "/test", pathSystem })
  const markdownSystem = new DocMarkdownSystem()

  const client = new DocClient({
    fileSystem,
    pathSystem,
    markdownSystem,
    indexFileName: "README.md",
    archiveDirectoryName: ".archive",
  })

  expect(client.fileSystem).toBe(fileSystem)
  expect(client.pathSystem).toBe(pathSystem)
  expect(client.markdownSystem).toBe(markdownSystem)
  expect(client.indexFileName).toBe("README.md")
  expect(client.archiveDirectoryName).toBe(".archive")
})

test("DocClient - basePathを取得", () => {
  const pathSystem = new DocPathSystem()
  const fileSystem = new DocFileSystem({ basePath: "/test/docs", pathSystem })
  const client = new DocClient({ fileSystem })

  expect(client.basePath()).toBe("/test/docs")
})
