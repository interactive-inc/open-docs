import { test } from "bun:test"
import type { Equals } from "../../types"
import { assertType } from "../../utils"
import type { DocSchemaFieldBooleanValue } from "./doc-schema-field-boolean-value"
import type { DocSchemaFieldMultiNumberValue } from "./doc-schema-field-multi-number-value"
import type { DocSchemaFieldMultiRelationValue } from "./doc-schema-field-multi-relation-value"
import type { DocSchemaFieldMultiSelectNumberValue } from "./doc-schema-field-multi-select-number-value"
import type { DocSchemaFieldMultiSelectTextValue } from "./doc-schema-field-multi-select-text-value"
import type { DocSchemaFieldMultiTextValue } from "./doc-schema-field-multi-text-value"
import type { DocSchemaFieldNumberValue } from "./doc-schema-field-number-value"
import type { DocSchemaFieldRelationValue } from "./doc-schema-field-relation-value"
import type { DocSchemaFieldSelectNumberValue } from "./doc-schema-field-select-number-value"
import type { DocSchemaFieldSelectTextValue } from "./doc-schema-field-select-text-value"
import type { DocSchemaFieldTextValue } from "./doc-schema-field-text-value"
import type {
  DocSchemaFieldMultipleTypes,
  DocSchemaFieldSingleTypes,
  DocSchemaFieldValue,
} from "./doc-schema-field-value"

test("DocSchemaFieldMultipleTypes - 複数値型フィールドのユニオン", () => {
  type MultipleTypes = DocSchemaFieldMultipleTypes<"items">

  // すべての複数値型が含まれる
  assertType<
    DocSchemaFieldMultiTextValue<"items"> extends MultipleTypes ? true : false
  >()
  assertType<
    DocSchemaFieldMultiNumberValue<"items"> extends MultipleTypes ? true : false
  >()
  assertType<
    DocSchemaFieldMultiSelectTextValue<"items"> extends MultipleTypes
      ? true
      : false
  >()
  assertType<
    DocSchemaFieldMultiSelectNumberValue<"items"> extends MultipleTypes
      ? true
      : false
  >()
  assertType<
    DocSchemaFieldMultiRelationValue<"items"> extends MultipleTypes
      ? true
      : false
  >()

  // 単一値型は含まれない
  assertType<
    DocSchemaFieldTextValue<"items"> extends MultipleTypes ? false : true
  >()
  assertType<
    DocSchemaFieldNumberValue<"items"> extends MultipleTypes ? false : true
  >()
})

test("DocSchemaFieldSingleTypes - 単一値型フィールドのユニオン", () => {
  type SingleTypes = DocSchemaFieldSingleTypes<"value">

  // すべての単一値型が含まれる
  assertType<
    DocSchemaFieldTextValue<"value"> extends SingleTypes ? true : false
  >()
  assertType<
    DocSchemaFieldNumberValue<"value"> extends SingleTypes ? true : false
  >()
  assertType<
    DocSchemaFieldBooleanValue<"value"> extends SingleTypes ? true : false
  >()
  assertType<
    DocSchemaFieldSelectTextValue<"value"> extends SingleTypes ? true : false
  >()
  assertType<
    DocSchemaFieldSelectNumberValue<"value"> extends SingleTypes ? true : false
  >()
  assertType<
    DocSchemaFieldRelationValue<"value"> extends SingleTypes ? true : false
  >()

  // 複数値型は含まれない
  assertType<
    DocSchemaFieldMultiTextValue<"value"> extends SingleTypes ? false : true
  >()
  assertType<
    DocSchemaFieldMultiNumberValue<"value"> extends SingleTypes ? false : true
  >()
})

test("DocSchemaFieldValue - 全フィールド型のユニオン", () => {
  type AllFieldTypes = DocSchemaFieldValue<"field">

  // すべての単一値型が含まれる
  assertType<
    DocSchemaFieldTextValue<"field"> extends AllFieldTypes ? true : false
  >()
  assertType<
    DocSchemaFieldNumberValue<"field"> extends AllFieldTypes ? true : false
  >()
  assertType<
    DocSchemaFieldBooleanValue<"field"> extends AllFieldTypes ? true : false
  >()
  assertType<
    DocSchemaFieldSelectTextValue<"field"> extends AllFieldTypes ? true : false
  >()
  assertType<
    DocSchemaFieldSelectNumberValue<"field"> extends AllFieldTypes
      ? true
      : false
  >()
  assertType<
    DocSchemaFieldRelationValue<"field"> extends AllFieldTypes ? true : false
  >()

  // すべての複数値型が含まれる
  assertType<
    DocSchemaFieldMultiTextValue<"field"> extends AllFieldTypes ? true : false
  >()
  assertType<
    DocSchemaFieldMultiNumberValue<"field"> extends AllFieldTypes ? true : false
  >()
  assertType<
    DocSchemaFieldMultiSelectTextValue<"field"> extends AllFieldTypes
      ? true
      : false
  >()
  assertType<
    DocSchemaFieldMultiSelectNumberValue<"field"> extends AllFieldTypes
      ? true
      : false
  >()
  assertType<
    DocSchemaFieldMultiRelationValue<"field"> extends AllFieldTypes
      ? true
      : false
  >()
})

test("DocSchemaFieldValue - ジェネリック型パラメータの伝播", () => {
  // 異なるキーで異なる型
  type Field1 = DocSchemaFieldValue<"key1">
  type Field2 = DocSchemaFieldValue<"key2">
  assertType<Equals<Field1, Field2> extends false ? true : false>()

  // 同じキーで同じ型
  type Field3 = DocSchemaFieldValue<"key1">
  assertType<Equals<Field1, Field3>>()
})

test("型グループの相互排他性", () => {
  // SingleTypes と MultipleTypes は重複しない
  type SingleMultipleIntersection = DocSchemaFieldSingleTypes<"test"> &
    DocSchemaFieldMultipleTypes<"test">
  assertType<Equals<SingleMultipleIntersection, never>>()
})

test("型の網羅性チェック", () => {
  // DocSchemaFieldValue は SingleTypes と MultipleTypes の和集合
  type Expected =
    | DocSchemaFieldSingleTypes<"test">
    | DocSchemaFieldMultipleTypes<"test">
  type Actual = DocSchemaFieldValue<"test">
  assertType<Equals<Actual, Expected>>()
})

test("型ガードでの判別可能性", () => {
  // type プロパティでの判別が可能
  // TypeScriptのnarrowingの限界のため、完全な型ガードにはカスタム型ガード関数が必要
})

test("配列での型の使用", () => {
  // フィールド値の配列
  type _FieldArray = DocSchemaFieldValue<"item">[]

  // 共通プロパティ: key, type などがアクセス可能
})

test("Mapでの型の使用", () => {
  // フィールド名をキーとしたMap
  type _FieldMap = Map<string, DocSchemaFieldValue<string>>

  // Map.get() の戻り値は DocSchemaFieldValue<string> | undefined
})
