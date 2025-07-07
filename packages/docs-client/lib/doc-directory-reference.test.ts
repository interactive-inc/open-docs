import { expect, test } from "bun:test"
import { DocDirectoryReference } from "./doc-directory-reference"
import type { DocFileSystem } from "./doc-file-system"
import { DocPathSystem } from "./doc-path-system"

test("DocDirectoryReference - directoryNames メソッドでサブディレクトリ名を取得できる", async () => {
  const mockFileSystem = {
    getBasePath: () => "/test",
    readDirectoryFileNames: async (path: string) => {
      if (path === "docs") {
        return ["file1.md", "subdir1", "subdir2", "_archive", "file2.txt"]
      }
      return []
    },
    isDirectory: async (path: string) => {
      return ["docs/subdir1", "docs/subdir2", "docs/_archive"].includes(path)
    },
  } as unknown as DocFileSystem

  const pathSystem = new DocPathSystem()
  const dirRef = new DocDirectoryReference({
    path: "docs",
    indexFileName: "index.md",
    archiveDirectoryName: "_",
    fileSystem: mockFileSystem,
    pathSystem,
  })

  const dirNames = await dirRef.directoryNames()

  expect(dirNames.length).toBe(2) // _archiveは除外
  expect(dirNames).toContain("subdir1")
  expect(dirNames).toContain("subdir2")
  expect(dirNames).not.toContain("_archive")
  expect(dirNames).not.toContain("file1.md")
  expect(dirNames).not.toContain("file2.txt")
})

test("DocDirectoryReference - directories メソッドでサブディレクトリ参照を取得できる", async () => {
  const mockFileSystem = {
    getBasePath: () => "/test",
    readDirectoryFileNames: async (path: string) => {
      if (path === "docs") {
        return ["subdir1", "subdir2", "_archive"]
      }
      return []
    },
    isDirectory: async (path: string) => {
      return ["docs/subdir1", "docs/subdir2", "docs/_archive"].includes(path)
    },
  } as unknown as DocFileSystem

  const pathSystem = new DocPathSystem()
  const dirRef = new DocDirectoryReference({
    path: "docs",
    indexFileName: "index.md",
    archiveDirectoryName: "_",
    fileSystem: mockFileSystem,
    pathSystem,
  })

  const directories = await dirRef.directories()

  expect(directories.length).toBe(2) // _archiveは除外
  expect(directories[0]).toBeInstanceOf(DocDirectoryReference)
  expect(directories[0].relativePath).toBe("docs/subdir1")
  expect(directories[1].relativePath).toBe("docs/subdir2")
})

test("DocDirectoryReference - 空のディレクトリでも正常に動作する", async () => {
  const mockFileSystem = {
    getBasePath: () => "/test",
    readDirectoryFileNames: async (_path: string) => {
      return [] // 空のディレクトリ
    },
    isDirectory: async (_path: string) => {
      return false
    },
  } as unknown as DocFileSystem

  const pathSystem = new DocPathSystem()
  const dirRef = new DocDirectoryReference({
    path: "empty",
    indexFileName: "index.md",
    archiveDirectoryName: "_",
    fileSystem: mockFileSystem,
    pathSystem,
  })

  const dirNames = await dirRef.directoryNames()
  const directories = await dirRef.directories()

  expect(dirNames.length).toBe(0)
  expect(directories.length).toBe(0)
})

test("DocDirectoryReference - directory メソッドで単一のサブディレクトリ参照を取得できる", () => {
  const mockFileSystem = {
    getBasePath: () => "/test",
  } as unknown as DocFileSystem

  const pathSystem = new DocPathSystem()
  const dirRef = new DocDirectoryReference({
    path: "docs",
    indexFileName: "index.md",
    archiveDirectoryName: "_",
    fileSystem: mockFileSystem,
    pathSystem,
  })

  const subdir = dirRef.directory("guides")

  expect(subdir).toBeInstanceOf(DocDirectoryReference)
  expect(subdir.relativePath).toBe("docs/guides")
  expect(subdir.indexFileName).toBe("index.md")
  expect(subdir.archiveDirectoryName).toBe("_")
})
