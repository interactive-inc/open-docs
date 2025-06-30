import { expect, test } from "bun:test"
import { DocFileIndexReference } from "./doc-file-index-reference"
import { DocFileSystemDebug } from "./doc-file-system-debug"
import { DocFileIndexEntity } from "./entities/doc-file-index-entity"

test("DocFileIndexReference - writeメソッドがフロントマターを含む完全なテキストを書き込む", async () => {
  const fileSystem = DocFileSystemDebug.createWithFiles({
    fileContents: {
      "docs/products/features/index.md": [
        "---",
        "icon: 📄",
        "schema:",
        "  milestone:",
        "    type: relation",
        "    required: false",
        "    title: マイルストーン",
        "    path: products/milestones",
        "---",
        "",
        "# 機能",
        "",
        "機能の説明",
      ].join("\n"),
    },
  })

  const ref = new DocFileIndexReference({
    path: "products/features/index.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
  })

  // 既存のエンティティを読み込む
  const entity = await ref.read()
  expect(entity).toBeInstanceOf(DocFileIndexEntity)

  // タイトルを更新
  const updatedEntity = entity.withContent(
    entity.content.withTitle("新しいタイトル"),
  )

  // ファイルに書き込む
  await ref.write(updatedEntity)

  // ファイルの内容を確認
  const writtenContent = fileSystem.getFileContent(
    "docs/products/features/index.md",
  )
  expect(writtenContent).toBeTruthy()

  // フロントマターが保持されていることを確認
  expect(writtenContent).toContain("---")
  expect(writtenContent).toContain("icon: 📄")
  expect(writtenContent).toContain("schema:")
  expect(writtenContent).toContain("type: relation")

  // タイトルが更新されていることを確認
  expect(writtenContent).toContain("# 新しいタイトル")

  // typeフィールドが含まれていないことを確認
  expect(writtenContent).not.toContain("type: index-frontmatter")
})

test("DocFileIndexReference - readメソッドが正しくエンティティを返す", async () => {
  const fileSystem = DocFileSystemDebug.createWithFiles({
    fileContents: {
      "docs/index.md": [
        "---",
        "icon: 📚",
        "schema: {}",
        "---",
        "",
        "# ドキュメント",
        "",
        "説明文",
      ].join("\n"),
    },
  })

  const ref = new DocFileIndexReference({
    path: "docs/index.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
  })

  const entity = await ref.read()
  expect(entity).toBeInstanceOf(DocFileIndexEntity)

  // コンテンツの確認
  expect(entity.content.title).toBe("ドキュメント")
  expect(entity.content.description).toBe("説明文")
  expect(entity.content.frontMatter.value.icon).toBe("📚")
  expect(entity.content.frontMatter.value.schema).toEqual({})
})
