import { expect, test } from "bun:test"
import type { DocFileSystem } from "./doc-file-system"
import { DocFileTreeSystem } from "./doc-file-tree-system"
import { DocPathSystem } from "./doc-path-system"
import { defaultTestConfig } from "./utils"

test("FileTreeSystem - ファイルツリーを構築できる", async () => {
  const mockFileSystem = {
    getBasePath: () => "/test",
    readDirectoryFileNames: async (path: string) => {
      if (path === "") return ["file1.md", "dir1", "_archive"]
      if (path === "dir1") return ["file2.md", "index.md"]
      return []
    },
    isDirectory: async (path: string) => {
      return path === "dir1" || path === "_archive"
    },
    readFile: async (path: string) => {
      if (path === "file1.md") {
        return `# File 1\n\nContent`
      }
      if (path === "dir1/file2.md") {
        return `# File 2\n\nContent`
      }
      if (path === "dir1/index.md") {
        return `# Directory 1

Content`
      }
      return ""
    },
    exists: async (path: string) => {
      return ["file1.md", "dir1/file2.md", "dir1/index.md"].includes(path)
    },
  } as unknown as DocFileSystem

  const pathSystem = new DocPathSystem()
  const fileTreeSystem = new DocFileTreeSystem({
    fileSystem: mockFileSystem,
    pathSystem,
    indexFileName: "index.md",
    archiveDirectoryName: "_archive",
    config: defaultTestConfig,
  })

  const tree = await fileTreeSystem.buildFileTree()
  if (tree instanceof Error) {
    throw tree
  }

  expect(tree.length).toBe(2) // file1.md と dir1 (_archiveは除外)

  // ファイルノード
  const fileNode = tree[0]
  expect(fileNode.name).toBe("file1.md")
  expect(fileNode.type).toBe("file")
  expect(fileNode.title).toBe("File 1")
  expect(fileNode.icon).toBe("📄")

  // ディレクトリノード
  const dirNode = tree[1]
  expect(dirNode.name).toBe("dir1")
  expect(dirNode.type).toBe("directory")
  expect(dirNode.title).toBe("Directory 1")
  expect(dirNode.icon).toBe("📁")

  if (dirNode.type === "directory") {
    expect(dirNode.children.length).toBe(2) // file2.md と index.md
  }
})

test("FileTreeSystem - ディレクトリツリーを構築できる（ディレクトリのみ）", async () => {
  const mockFileSystem = {
    getBasePath: () => "/test",
    readDirectoryFileNames: async (path: string) => {
      if (path === "") return ["file1.md", "dir1", "dir2", "_archive"]
      if (path === "dir1") return ["subdir1", "file.md"]
      if (path === "dir2") return ["index.md"]
      if (path === "dir1/subdir1") return []
      return []
    },
    isDirectory: async (path: string) => {
      return ["dir1", "dir2", "dir1/subdir1"].includes(path)
    },
    readFile: async (path: string) => {
      if (path === "dir2/index.md") {
        return `---
icon: 📁
---

# Directory 2

Content`
      }
      return ""
    },
    exists: async (path: string) => {
      return path === "dir2/index.md"
    },
  } as unknown as DocFileSystem

  const pathSystem = new DocPathSystem()
  const fileTreeSystem = new DocFileTreeSystem({
    fileSystem: mockFileSystem,
    pathSystem,
    indexFileName: "index.md",
    archiveDirectoryName: "_archive",
    config: defaultTestConfig,
  })

  const tree = await fileTreeSystem.buildDirectoryTree()
  if (tree instanceof Error) {
    throw tree
  }

  expect(tree.length).toBe(2) // dir1 と dir2のみ (file1.mdと_archiveは除外)

  const dir1 = tree[0]
  expect(dir1.name).toBe("dir1")
  expect(dir1.type).toBe("directory")

  const dir2 = tree[1]
  expect(dir2.name).toBe("dir2")
  expect(dir2.type).toBe("directory")
  expect(dir2.title).toBe("Directory 2")

  if (dir1.type === "directory") {
    expect(dir1.children.length).toBe(1) // subdir1のみ
    expect(dir1.children[0].name).toBe("subdir1")
  }
})

test("FileTreeSystem - directoryExcludesで指定されたディレクトリが除外される", async () => {
  const mockFileSystem = {
    getBasePath: () => "/test",
    readDirectoryFileNames: async (path: string) => {
      if (path === "") {
        return ["docs", ".vitepress", "node_modules", "_archive"]
      }
      if (path === "docs") {
        return ["index.md"]
      }
      return []
    },
    isDirectory: async (path: string) => {
      return ["docs", ".vitepress", "node_modules", "_archive"].includes(path)
    },
    exists: async (path: string) => {
      return path === "docs/index.md"
    },
    readFile: async (path: string) => {
      if (path === "docs/index.md") {
        return "# Docs\n\nDocumentation"
      }
      return null
    },
  } as unknown as DocFileSystem

  const pathSystem = new DocPathSystem()

  // .vitepressとnode_modulesを除外する設定
  const config = {
    ...defaultTestConfig,
    directoryExcludes: [".vitepress", "node_modules"],
  }

  const fileTreeSystem = new DocFileTreeSystem({
    fileSystem: mockFileSystem,
    pathSystem,
    indexFileName: "index.md",
    archiveDirectoryName: "_archive",
    config,
  })

  const tree = await fileTreeSystem.buildFileTree()
  if (tree instanceof Error) {
    throw tree
  }

  // .vitepress、node_modules、_archiveが除外され、docsのみが残る
  expect(tree.length).toBe(1)
  expect(tree[0].name).toBe("docs")

  const directoryTree = await fileTreeSystem.buildDirectoryTree()
  if (directoryTree instanceof Error) {
    throw directoryTree
  }
  expect(directoryTree.length).toBe(1)
  expect(directoryTree[0].name).toBe("docs")
})
