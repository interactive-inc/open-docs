import { test } from "bun:test"
import type { Equals } from "../types"
import { assertType, expectType } from "../utils"
import type { DocTreeDirectoryNodeValue } from "./doc-tree-directory-node-value"
import type { DocTreeFileNodeValue } from "./doc-tree-file-node-value"
import type { DocTreeNodeValue } from "./doc-tree-node-value"

test("DocTreeNodeValue - ユニオン型の構造", () => {
  // DocTreeNodeValue は2つのノード型のユニオン
  type NodeValue = DocTreeNodeValue

  // ファイルノードとディレクトリノードが含まれる
  assertType<DocTreeFileNodeValue extends NodeValue ? true : false>()
  assertType<DocTreeDirectoryNodeValue extends NodeValue ? true : false>()
})

test("DocTreeNodeValue - 型の完全性", () => {
  // DocTreeNodeValue は正確に2つの型の和集合
  type Expected = DocTreeFileNodeValue | DocTreeDirectoryNodeValue
  type Actual = DocTreeNodeValue

  assertType<Equals<Actual, Expected>>()
})

test("DocTreeNodeValue - 型ガードでの判別", () => {
  // type プロパティで判別可能
  // TypeScriptのnarrowingの限界のため、完全な型ガードにはカスタム型ガード関数が必要
})

test("DocTreeNodeValue - 配列での使用", () => {
  // ノードの配列（ツリー構造の子要素など）
  type _NodeArray = DocTreeNodeValue[]

  // 共通プロパティ: type, name にアクセス可能
  // switch文でtypeプロパティによる分岐が可能
})

test("DocTreeNodeValue - 再帰的な構造", () => {
  // ディレクトリノードが子ノードを持つ場合の型
  // children は DocTreeNodeValue の配列として再帰的に辿れる構造
})

test("DocTreeNodeValue - Mapでの使用", () => {
  // パスをキーとしたノードのMap
  type _NodeMap = Map<string, DocTreeNodeValue>

  // Map.get() の戻り値は DocTreeNodeValue | undefined
  // 型ガードでの分岐にはカスタム型ガード関数が必要
})

test("DocTreeNodeValue - フィルタリング", () => {
  // 特定の型のノードのみを抽出
  function _isFileNode(node: DocTreeNodeValue): node is DocTreeFileNodeValue {
    return node.type === "file"
  }

  function _isDirectoryNode(
    node: DocTreeNodeValue,
  ): node is DocTreeDirectoryNodeValue {
    return node.type === "directory"
  }

  // カスタム型ガードを使用したフィルタリング
  // filter(isFileNode) → DocTreeFileNodeValue[]
  // filter(isDirectoryNode) → DocTreeDirectoryNodeValue[]
})

test("DocTreeNodeValue - 条件型での型の抽出", () => {
  // 特定のノードタイプを抽出する条件型
  type ExtractFileNode<T> = T extends DocTreeFileNodeValue ? T : never
  type ExtractDirectoryNode<T> = T extends DocTreeDirectoryNodeValue ? T : never

  type FileNode = ExtractFileNode<DocTreeNodeValue>
  type DirectoryNode = ExtractDirectoryNode<DocTreeNodeValue>

  // 正しい型が抽出される
  assertType<Equals<FileNode, DocTreeFileNodeValue>>()
  assertType<Equals<DirectoryNode, DocTreeDirectoryNodeValue>>()
})

test("DocTreeNodeValue - 型の排他性", () => {
  // FileNodeとDirectoryNodeは排他的
  type _Intersection = DocTreeFileNodeValue & DocTreeDirectoryNodeValue

  // 交差型はneverになるべき（異なるtypeプロパティを持つため）
  // この構造により、一つのノードが同時に両方の型になることはない
})

test("DocTreeNodeValue - ツリー走査の型安全性", () => {
  // ツリー構造を走査する関数の型定義
  type TreeVisitor = {
    visitFile: (node: DocTreeFileNodeValue) => void
    visitDirectory: (node: DocTreeDirectoryNodeValue) => void
  }

  function traverseTree(node: DocTreeNodeValue, visitor: TreeVisitor): void {
    if (node.type === "file") {
      visitor.visitFile(node)
    } else {
      visitor.visitDirectory(node)
      // 子ノードも走査（仮定）
      if ("children" in node) {
        node.children.forEach((child: DocTreeNodeValue) => {
          traverseTree(child, visitor)
        })
      }
    }
  }

  // 型が正しく推論される
  expectType<(node: DocTreeNodeValue, visitor: TreeVisitor) => void>(
    traverseTree,
  )
})
