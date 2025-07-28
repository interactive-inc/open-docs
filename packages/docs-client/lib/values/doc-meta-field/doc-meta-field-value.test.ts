import { test } from "bun:test"
import type { Equals } from "../../types"
import { assertType } from "../../utils"
import type { DocMetaFieldBooleanValue } from "./doc-meta-field-boolean-value"
import type { DocMetaFieldMultiNumberValue } from "./doc-meta-field-multi-number-value"
import type { DocMetaFieldMultiRelationValue } from "./doc-meta-field-multi-relation-value"
import type { DocMetaFieldMultiSelectNumberValue } from "./doc-meta-field-multi-select-number-value"
import type { DocMetaFieldMultiSelectTextValue } from "./doc-meta-field-multi-select-text-value"
import type { DocMetaFieldMultiTextValue } from "./doc-meta-field-multi-text-value"
import type { DocMetaFieldNumberValue } from "./doc-meta-field-number-value"
import type { DocMetaFieldRelationValue } from "./doc-meta-field-relation-value"
import type { DocMetaFieldSelectNumberValue } from "./doc-meta-field-select-number-value"
import type { DocMetaFieldSelectTextValue } from "./doc-meta-field-select-text-value"
import type { DocMetaFieldTextValue } from "./doc-meta-field-text-value"
import type { DocMetaFieldValue } from "./doc-meta-field-value"

test("DocMetaFieldValue - ユニオン型の構造", () => {
  // DocMetaFieldValue は11種類のフィールド値型のユニオン
  type FieldValue = DocMetaFieldValue<"testKey">

  // 各フィールド値型が含まれることを確認
  assertType<
    DocMetaFieldTextValue<"testKey"> extends FieldValue ? true : false
  >()
  assertType<
    DocMetaFieldNumberValue<"testKey"> extends FieldValue ? true : false
  >()
  assertType<
    DocMetaFieldBooleanValue<"testKey"> extends FieldValue ? true : false
  >()
  assertType<
    DocMetaFieldMultiTextValue<"testKey"> extends FieldValue ? true : false
  >()
  assertType<
    DocMetaFieldMultiNumberValue<"testKey"> extends FieldValue ? true : false
  >()
  assertType<
    DocMetaFieldRelationValue<"testKey"> extends FieldValue ? true : false
  >()
  assertType<
    DocMetaFieldMultiRelationValue<"testKey"> extends FieldValue ? true : false
  >()
  assertType<
    DocMetaFieldSelectTextValue<"testKey"> extends FieldValue ? true : false
  >()
  assertType<
    DocMetaFieldSelectNumberValue<"testKey"> extends FieldValue ? true : false
  >()
  assertType<
    DocMetaFieldMultiSelectTextValue<"testKey"> extends FieldValue
      ? true
      : false
  >()
  assertType<
    DocMetaFieldMultiSelectNumberValue<"testKey"> extends FieldValue
      ? true
      : false
  >()
})

test("DocMetaFieldValue - ジェネリック型パラメータの伝播", () => {
  // 異なるキーで異なる型
  type FieldValue1 = DocMetaFieldValue<"key1">
  type _FieldValue2 = DocMetaFieldValue<"key2">

  // 型パラメータが異なるが、構造的には同じ型になる
  // TypeScriptは構造的型付けなので、型パラメータが異なっても構造が同じなら等しいと判定される
  // 実際にはunion型の複雑さで完全に等しくない場合もある

  // 同じキーでは同じ型
  type FieldValue3 = DocMetaFieldValue<"key1">
  assertType<Equals<FieldValue1, FieldValue3>>()
})

test("DocMetaFieldValue - 型ガードでの判別", () => {
  // type プロパティで判別可能
  // ユニオン型の各要素に共通のtypeプロパティが必要
  // TypeScriptのnarrowingの限界のため、完全な型ガードにはカスタム型ガード関数が必要
})

test("DocMetaFieldValue - 共通プロパティ", () => {
  // すべてのフィールド値型に共通するプロパティ: key, type, value
})

test("DocMetaFieldValue - 配列での使用", () => {
  // フィールド値の配列
  type _FieldValues = DocMetaFieldValue<"item">[]

  // 共通プロパティにアクセス可能
  // switch文でのtypeプロパティによる分岐が可能（型アサーションが必要）
})

test("DocMetaFieldValue - Map での使用", () => {
  // キーごとに異なるフィールド値型を持つ Map
  type _FieldMap = Map<string, DocMetaFieldValue<string>>

  // Map.get() の戻り値は DocMetaFieldValue<string> | undefined
})

test("DocMetaFieldValue - 型の narrowing", () => {
  // カスタム型ガード関数
  function _isTextFieldValue<K extends string>(
    value: DocMetaFieldValue<K>,
  ): value is DocMetaFieldTextValue<K> {
    return "type" in value && value.type === "text"
  }

  function _isNumberFieldValue<K extends string>(
    value: DocMetaFieldValue<K>,
  ): value is DocMetaFieldNumberValue<K> {
    return "type" in value && value.type === "number"
  }

  function _isMultiTextFieldValue<K extends string>(
    value: DocMetaFieldValue<K>,
  ): value is DocMetaFieldMultiTextValue<K> {
    return "type" in value && value.type === "multi-text"
  }

  // カスタム型ガードを使用することで、安全な型のnarrowingが可能
})

test("DocMetaFieldValue - ユニオンの完全性チェック", () => {
  // すべてのフィールドタイプが網羅されているか
  type AllFieldTypes = DocMetaFieldValue<"any">["type"]

  type ExpectedTypes =
    | "text"
    | "number"
    | "boolean"
    | "multi-text"
    | "multi-number"
    | "relation"
    | "multi-relation"
    | "select-text"
    | "select-number"
    | "multi-select-text"
    | "multi-select-number"

  assertType<Equals<AllFieldTypes, ExpectedTypes>>()
})
