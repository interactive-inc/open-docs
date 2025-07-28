import { test } from "bun:test"
import type { DocCustomSchema } from "../types"
import { assertType } from "../utils"
import type { DocFileEntity } from "./doc-file-entity"
import type { DocFileIndexEntity } from "./doc-file-index-entity"
import type { DocFileMdEntity } from "./doc-file-md-entity"
import type { DocFileUnknownEntity } from "./doc-file-unknown-entity"

test("DocFileEntity - ユニオン型の構造", () => {
  type TestSchema = {
    title: { type: "text"; required: true }
    tags: { type: "multi-text"; required: false }
  }

  // DocFileEntity は3つのエンティティ型のユニオン
  type _FileEntity = DocFileEntity<TestSchema>

  // 各エンティティ型が含まれることを確認
  assertType<DocFileMdEntity<TestSchema> extends _FileEntity ? true : false>()
  assertType<
    DocFileIndexEntity<TestSchema> extends _FileEntity ? true : false
  >()
  assertType<DocFileUnknownEntity extends _FileEntity ? true : false>()
})

test("DocFileEntity - 型ガードでの判別", () => {
  type TestSchema = {
    author: { type: "text"; required: true }
    category: { type: "select-text"; required: false }
  }

  // ファイルエンティティの型
  type _FileEntity = DocFileEntity<TestSchema>

  // TypeScriptのnarrowingの限界のため、型ガードが完全に効かないことをドキュメント
  // 実際の使用時にはカスタム型ガード関数の使用を推奨
})

test("DocFileEntity - 共通プロパティ", () => {
  type TestSchema = {
    title: { type: "text"; required: true }
  }

  type _FileEntity = DocFileEntity<TestSchema>

  // すべてのエンティティに共通するプロパティ:
  // - value: { type: string, isArchived: boolean, ... }
  // - path: { path: string, name: string, fullPath: string, nameWithExtension: string }
})

test("DocFileEntity - ジェネリック型パラメータの伝播", () => {
  // 複雑なスキーマ
  type ComplexSchema = {
    title: { type: "text"; required: true }
    description: { type: "text"; required: false }
    tags: { type: "multi-text"; required: true }
    author: { type: "relation"; required: true }
    reviewers: { type: "multi-relation"; required: false }
    status: { type: "select-text"; required: true }
    priority: { type: "select-number"; required: false }
    isPublished: { type: "boolean"; required: true }
    viewCount: { type: "number"; required: false }
  }

  type _FileEntity = DocFileEntity<ComplexSchema>

  // 各エンティティ型が正しいスキーマ型を持つ
  // DocFileMdEntity<ComplexSchema> の場合、frontMatter の値が ComplexSchema に従う
})

test("DocFileEntity - 配列での使用", () => {
  type TestSchema = {
    name: { type: "text"; required: true }
  }

  // ファイルエンティティの配列
  type _FileEntities = DocFileEntity<TestSchema>[]

  // 配列の各要素は共通プロパティにアクセス可能
  // TypeScriptのnarrowingの限界のため、switch文での型ガードは完全には効かない
})

test("DocFileEntity - Map や Set での使用", () => {
  type TestSchema = {
    id: { type: "text"; required: true }
  }

  // Map のキーと値の型
  type _EntityMap = Map<string, DocFileEntity<TestSchema>>
  // Map.get() の返り値は DocFileEntity<TestSchema> | undefined

  // Set の型
  type _EntitySet = Set<DocFileEntity<TestSchema>>
  // Set の反復処理では DocFileEntity<TestSchema> 型が得られる
})

test("DocFileEntity - 型の narrowing", () => {
  type _TestSchema = {
    content: { type: "text"; required: true }
  }

  // カスタム型ガード関数
  function _isMarkdownEntity<T extends DocCustomSchema>(
    entity: DocFileEntity<T>,
  ): entity is DocFileMdEntity<T> {
    return entity.value.type === "markdown"
  }

  function _isIndexEntity<T extends DocCustomSchema>(
    entity: DocFileEntity<T>,
  ): entity is DocFileIndexEntity<T> {
    return entity.value.type === "index"
  }

  function _isUnknownEntity(
    entity: DocFileEntity<DocCustomSchema>,
  ): entity is DocFileUnknownEntity {
    return entity.value.type === "unknown"
  }

  // カスタム型ガード関数により、安全な型のnarrowingが可能
  // isMarkdownEntity → DocFileMdEntity<T>
  // isIndexEntity → DocFileIndexEntity<T>
  // isUnknownEntity → DocFileUnknownEntity
})
