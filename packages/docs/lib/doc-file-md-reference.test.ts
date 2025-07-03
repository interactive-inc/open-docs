import { expect, test } from "bun:test"
import { DocFileMdReference } from "./doc-file-md-reference"
import { DocFileSystemDebug } from "./doc-file-system-debug"
import { DocFileMdEntity } from "./entities/doc-file-md-entity"
import { DocFilePathValue } from "./values/doc-file-path-value"
import type { DocFileSystem } from "./doc-file-system"
import { DocPathSystem } from "./doc-path-system"

test("DocFileMdReference - writeメソッドがフロントマターを含む完全なテキストを書き込む", async () => {
  const fileSystem = DocFileSystemDebug.createWithFiles({
    fileContents: {
      "docs/products/entities/user-entity.md": [
        "---",
        "type: entity",
        "title: ユーザー",
        "---",
        "",
        "# ユーザー",
        "",
        "ユーザーの説明",
      ].join("\n"),
    },
  })

  const ref = new DocFileMdReference({
    path: "docs/products/entities/user-entity.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
  })

  // 既存のエンティティを読み込む
  const entity = await ref.read()

  if (entity instanceof Error) {
    throw entity
  }

  expect(entity).toBeInstanceOf(DocFileMdEntity)

  // タイトルを更新
  const updatedEntity = entity.withContent(
    entity.content.withTitle("新しいタイトル"),
  )

  // ファイルに書き込む
  await ref.write(updatedEntity)

  // ファイルの内容を確認
  const writtenContent = fileSystem.getFileContent(
    "docs/products/entities/user-entity.md",
  )
  expect(writtenContent).toBeTruthy()

  // フロントマターが保持されていることを確認
  expect(writtenContent).toContain("---")
  expect(writtenContent).toContain("type: entity")
  expect(writtenContent).toContain("title: ユーザー")

  // タイトルが更新されていることを確認
  expect(writtenContent).toContain("# 新しいタイトル")
})

test("DocFileMdReference - readメソッドが正しくエンティティを返す", async () => {
  const fileSystem = DocFileSystemDebug.createWithFiles({
    fileContents: {
      "docs/features/login.md": [
        "---",
        "type: feature",
        "status: in-progress",
        "---",
        "",
        "# ログイン機能",
        "",
        "ユーザーがシステムにログインする機能",
      ].join("\n"),
    },
  })

  const ref = new DocFileMdReference({
    path: "docs/features/login.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
  })

  const entity = await ref.read()

  if (entity instanceof Error) {
    throw entity
  }

  expect(entity).toBeInstanceOf(DocFileMdEntity)

  // コンテンツの確認
  expect(entity.content.title).toBe("ログイン機能")
  // bodyにはタイトルと説明が含まれる
  expect(entity.content.body).toBe(
    "# ログイン機能\n\nユーザーがシステムにログインする機能",
  )
  expect(entity.content.description).toBe(
    "ユーザーがシステムにログインする機能",
  )
  expect(entity.content.frontMatter.value.type).toBe("feature")
  expect(entity.content.frontMatter.value.status).toBe("in-progress")
})

test("DocFileMdReference - 新規ファイルの作成", async () => {
  const fileSystem = DocFileSystemDebug.createWithFiles({})

  const ref = new DocFileMdReference({
    path: "docs/products/values/price-value.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
  })

  // 新しいエンティティを作成
  const pathValue = DocFilePathValue.fromPathWithSystem(
    "docs/products/values/price-value.md",
    fileSystem.getPathSystem(),
  )
  const entity = new DocFileMdEntity({
    type: "markdown",
    path: pathValue.value,
    content: {
      type: "markdown-content",
      title: "価格",
      body: "# 価格\n\n商品の価格を表す値オブジェクト",
      description: "商品の価格を表す値オブジェクト",
      frontMatter: {
        value: {
          type: "value-object",
          attributes: ["amount", "currency"],
        },
      },
    },
    isArchived: false,
  })

  // ファイルに書き込む
  await ref.write(entity)

  // ファイルの内容を確認
  const writtenContent = fileSystem.getFileContent(
    "docs/products/values/price-value.md",
  )
  expect(writtenContent).toBeTruthy()

  // 内容の確認
  expect(writtenContent).toContain("---")
  expect(writtenContent).toContain("type: value-object")
  // YAMLの配列は複数行形式で出力される
  expect(writtenContent).toContain("attributes:")
  expect(writtenContent).toContain("- amount")
  expect(writtenContent).toContain("- currency")
  expect(writtenContent).toContain("# 価格")
  expect(writtenContent).toContain("商品の価格を表す値オブジェクト")
})

// リレーション関連のテスト

test("getDirectoryIndex メソッドはディレクトリのindex.mdを返す", async () => {
  const files: Record<string, string> = {
    "products/doc-browser/pages/index.md": `---
schema:
  features:
    type: multi-relation
    path: docs/products/doc-browser/features
    required: false
    title: Features
    description: List of features
    default: []
---
# Pages`,
    "products/doc-browser/pages/home.md": `---
features:
  - list-documents
  - create-document
---
# Home Page`,
  }

  const pathSystem = new DocPathSystem()
  const mockFileSystem = {
    getBasePath: () => "",
    readFile: async (path: string) => {
      // アーカイブチェックも含む
      if (files[path]) return files[path]

      // アーカイブパスをチェック
      const dirPath = pathSystem.dirname(path)
      const fileName = pathSystem.basename(path)
      const archivePath = pathSystem.join(dirPath, "_", fileName)

      return files[archivePath] || null
    },
    exists: async (path: string) => path in files,
    pathSystem,
  } as unknown as DocFileSystem

  const fileSystem = mockFileSystem

  const fileRef = new DocFileMdReference({
    path: "products/doc-browser/pages/home.md",
    fileSystem: fileSystem,
    pathSystem: pathSystem,
  })

  const indexFile = await fileRef.getDirectoryIndex()
  expect(indexFile).not.toBeNull()
  expect(indexFile?.content.frontMatter.value.schema).toBeDefined()
})

test("getDirectoryIndex メソッドはindex.mdがない場合nullを返す", async () => {
  const files: Record<string, string> = {
    "products/doc-browser/pages/home.md": `# Home Page`,
  }

  const pathSystem = new DocPathSystem()
  const mockFileSystem = {
    getBasePath: () => "",
    readFile: async (path: string) => {
      // アーカイブチェックも含む
      if (files[path]) return files[path]

      // アーカイブパスをチェック
      const dirPath = pathSystem.dirname(path)
      const fileName = pathSystem.basename(path)
      const archivePath = pathSystem.join(dirPath, "_", fileName)

      return files[archivePath] || null
    },
    exists: async (path: string) => path in files,
    pathSystem,
  } as unknown as DocFileSystem

  const fileSystem = mockFileSystem

  const fileRef = new DocFileMdReference({
    path: "products/doc-browser/pages/home.md",
    fileSystem: fileSystem,
    pathSystem: pathSystem,
  })

  const indexFile = await fileRef.getDirectoryIndex()
  expect(indexFile).toBeNull()
})

test("relation メソッドはスキーマに基づいてリレーションを解決する", async () => {
  const files: Record<string, string> = {
    "products/doc-browser/pages/index.md": `---
schema:
  author:
    type: relation
    path: users
    required: false
    title: Author
    description: Document author
    default: null
---
# Pages`,
    "products/doc-browser/pages/home.md": `---
author: john-doe
---
# Home Page`,
    "users/john-doe.md": `# John Doe`,
  }

  const pathSystem = new DocPathSystem()
  const mockFileSystem = {
    getBasePath: () => "",
    readFile: async (path: string) => {
      // アーカイブチェックも含む
      if (files[path]) return files[path]

      // アーカイブパスをチェック
      const dirPath = pathSystem.dirname(path)
      const fileName = pathSystem.basename(path)
      const archivePath = pathSystem.join(dirPath, "_", fileName)

      return files[archivePath] || null
    },
    exists: async (path: string) => path in files,
    pathSystem,
  } as unknown as DocFileSystem

  const fileSystem = mockFileSystem

  const fileRef = new DocFileMdReference({
    path: "products/doc-browser/pages/home.md",
    fileSystem: fileSystem,
    pathSystem: pathSystem,
  })

  const relationRef = await fileRef.relation("author")
  expect(relationRef).not.toBeNull()
  expect(relationRef).not.toBeInstanceOf(Error)

  if (relationRef && !(relationRef instanceof Error)) {
    expect(relationRef.path).toBe("users/john-doe.md")

    const relationFile = await relationRef.read()
    expect(relationFile).not.toBeInstanceOf(Error)

    if (!(relationFile instanceof Error)) {
      expect(relationFile.content.title).toBe("John Doe")
    }
  }
})

test("relation メソッドはスキーマがない場合nullを返す", async () => {
  const files: Record<string, string> = {
    "products/doc-browser/pages/home.md": `---
author: users/john-doe
---
# Home Page`,
    "users/john-doe.md": `# John Doe`,
  }

  const pathSystem = new DocPathSystem()
  const mockFileSystem = {
    getBasePath: () => "",
    readFile: async (path: string) => {
      // アーカイブチェックも含む
      if (files[path]) return files[path]

      // アーカイブパスをチェック
      const dirPath = pathSystem.dirname(path)
      const fileName = pathSystem.basename(path)
      const archivePath = pathSystem.join(dirPath, "_", fileName)

      return files[archivePath] || null
    },
    exists: async (path: string) => path in files,
    pathSystem,
  } as unknown as DocFileSystem

  const fileSystem = mockFileSystem

  const fileRef = new DocFileMdReference({
    path: "products/doc-browser/pages/home.md",
    fileSystem: fileSystem,
    pathSystem: pathSystem,
  })

  const relationRef = await fileRef.relation("author")
  expect(relationRef).toBeNull()
})

test("multiRelation メソッドは複数のリレーションを解決する", async () => {
  const files: Record<string, string> = {
    "products/doc-browser/pages/index.md": `---
schema:
  features:
    type: multi-relation
    path: docs/products/doc-browser/features
    required: false
    title: Features
    description: List of features
    default: []
---
# Pages`,
    "products/doc-browser/pages/home.md": `---
features:
  - list-documents
  - create-document
  - delete-document
---
# Home Page`,
    "docs/products/doc-browser/features/list-documents.md": `# List Documents`,
    "docs/products/doc-browser/features/create-document.md": `# Create Document`,
    "docs/products/doc-browser/features/delete-document.md": `# Delete Document`,
  }

  const pathSystem = new DocPathSystem()
  const mockFileSystem = {
    getBasePath: () => "",
    readFile: async (path: string) => {
      // アーカイブチェックも含む
      if (files[path]) return files[path]

      // アーカイブパスをチェック
      const dirPath = pathSystem.dirname(path)
      const fileName = pathSystem.basename(path)
      const archivePath = pathSystem.join(dirPath, "_", fileName)

      return files[archivePath] || null
    },
    exists: async (path: string) => path in files,
    pathSystem,
  } as unknown as DocFileSystem

  const fileSystem = mockFileSystem

  const fileRef = new DocFileMdReference({
    path: "products/doc-browser/pages/home.md",
    fileSystem: fileSystem,
    pathSystem: pathSystem,
  })

  const relationRefs = await fileRef.multiRelation("features")
  expect(relationRefs).toHaveLength(3)

  expect(relationRefs[0].path).toBe(
    "docs/products/doc-browser/features/list-documents.md",
  )
  expect(relationRefs[1].path).toBe(
    "docs/products/doc-browser/features/create-document.md",
  )
  expect(relationRefs[2].path).toBe(
    "docs/products/doc-browser/features/delete-document.md",
  )
})

test("multiRelation メソッドは空のリレーションで空配列を返す", async () => {
  const files: Record<string, string> = {
    "products/doc-browser/pages/index.md": `---
schema:
  features:
    type: multi-relation
    path: docs/products/doc-browser/features
    required: false
    title: Features
    description: List of features
    default: []
---
# Pages`,
    "products/doc-browser/pages/home.md": `---
features: []
---
# Home Page`,
  }

  const pathSystem = new DocPathSystem()
  const mockFileSystem = {
    getBasePath: () => "",
    readFile: async (path: string) => {
      // アーカイブチェックも含む
      if (files[path]) return files[path]

      // アーカイブパスをチェック
      const dirPath = pathSystem.dirname(path)
      const fileName = pathSystem.basename(path)
      const archivePath = pathSystem.join(dirPath, "_", fileName)

      return files[archivePath] || null
    },
    exists: async (path: string) => path in files,
    pathSystem,
  } as unknown as DocFileSystem

  const fileSystem = mockFileSystem

  const fileRef = new DocFileMdReference({
    path: "products/doc-browser/pages/home.md",
    fileSystem: fileSystem,
    pathSystem: pathSystem,
  })

  const relationRefs = await fileRef.multiRelation("features")
  expect(relationRefs).toEqual([])
})

test("relation メソッドはリレーションフィールドでない場合nullを返す", async () => {
  const files: Record<string, string> = {
    "products/doc-browser/pages/index.md": `---
schema:
  title:
    type: text
    required: true
    title: Title
    description: Page title
    default: ""
---
# Pages`,
    "products/doc-browser/pages/home.md": `---
title: ホームページ
---
# Home Page`,
  }

  const pathSystem = new DocPathSystem()
  const mockFileSystem = {
    getBasePath: () => "",
    readFile: async (path: string) => {
      // アーカイブチェックも含む
      if (files[path]) return files[path]

      // アーカイブパスをチェック
      const dirPath = pathSystem.dirname(path)
      const fileName = pathSystem.basename(path)
      const archivePath = pathSystem.join(dirPath, "_", fileName)

      return files[archivePath] || null
    },
    exists: async (path: string) => path in files,
    pathSystem,
  } as unknown as DocFileSystem

  const fileSystem = mockFileSystem

  const fileRef = new DocFileMdReference({
    path: "products/doc-browser/pages/home.md",
    fileSystem: fileSystem,
    pathSystem: pathSystem,
  })

  const relationRef = await fileRef.relation("title")
  expect(relationRef).toBeNull()
})

test("index.mdがアーカイブにある場合も取得できる", async () => {
  const files: Record<string, string> = {
    "products/doc-browser/pages/_/index.md": `---
schema:
  features:
    type: multi-relation
    path: docs/products/doc-browser/features
    required: false
    title: Features
    description: List of features
    default: []
---
# Pages (Archived)`,
    "products/doc-browser/pages/home.md": `---
features:
  - list-documents
---
# Home Page`,
  }

  const pathSystem = new DocPathSystem()
  const mockFileSystem = {
    getBasePath: () => "",
    readFile: async (path: string) => {
      // アーカイブチェックも含む
      if (files[path]) return files[path]

      // アーカイブパスをチェック
      const dirPath = pathSystem.dirname(path)
      const fileName = pathSystem.basename(path)
      const archivePath = pathSystem.join(dirPath, "_", fileName)

      return files[archivePath] || null
    },
    exists: async (path: string) => path in files,
    pathSystem,
  } as unknown as DocFileSystem

  const fileSystem = mockFileSystem

  const fileRef = new DocFileMdReference({
    path: "products/doc-browser/pages/home.md",
    fileSystem: fileSystem,
    pathSystem: pathSystem,
  })

  const indexFile = await fileRef.getDirectoryIndex()
  expect(indexFile).not.toBeNull()
  // アーカイブのindex.mdが取得できることを確認
  expect(indexFile?.content.frontMatter.value.schema).toBeDefined()
})
