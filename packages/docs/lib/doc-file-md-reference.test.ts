import { expect, test } from "bun:test"
import { DocFileMdReference } from "./doc-file-md-reference"
import { DocFileSystemDebug } from "./doc-file-system-debug"
import { DocFileMdEntity } from "./entities/doc-file-md-entity"
import { DocFilePathValue } from "./values/doc-file-path-value"

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
