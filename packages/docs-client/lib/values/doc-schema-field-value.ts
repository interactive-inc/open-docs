import type { DocSchemaFieldBooleanMultipleValue } from "./doc-schema-field-boolean-multiple-value"
import type { DocSchemaFieldBooleanSingleValue } from "./doc-schema-field-boolean-single-value"
import type { DocSchemaFieldNumberMultipleValue } from "./doc-schema-field-number-multiple-value"
import type { DocSchemaFieldNumberSingleValue } from "./doc-schema-field-number-single-value"
import type { DocSchemaFieldRelationMultipleValue } from "./doc-schema-field-relation-multiple-value"
import type { DocSchemaFieldRelationSingleValue } from "./doc-schema-field-relation-single-value"
import type { DocSchemaFieldSelectNumberMultipleValue } from "./doc-schema-field-select-number-multiple-value"
import type { DocSchemaFieldSelectNumberSingleValue } from "./doc-schema-field-select-number-single-value"
import type { DocSchemaFieldSelectTextMultipleValue } from "./doc-schema-field-select-text-multiple-value"
import type { DocSchemaFieldSelectTextSingleValue } from "./doc-schema-field-select-text-single-value"
import type { DocSchemaFieldTextMultipleValue } from "./doc-schema-field-text-multiple-value"
import type { DocSchemaFieldTextSingleValue } from "./doc-schema-field-text-single-value"

/**
 * テキスト型フィールド
 */
export type DocSchemaFieldTextTypes =
  | DocSchemaFieldTextSingleValue
  | DocSchemaFieldTextMultipleValue

/**
 * 数値型フィールド
 */
export type DocSchemaFieldNumberTypes =
  | DocSchemaFieldNumberSingleValue
  | DocSchemaFieldNumberMultipleValue

/**
 * ブール型フィールド
 */
export type DocSchemaFieldBooleanTypes =
  | DocSchemaFieldBooleanSingleValue
  | DocSchemaFieldBooleanMultipleValue

/**
 * 選択型フィールド
 */
export type DocSchemaFieldSelectTypes =
  | DocSchemaFieldSelectTextSingleValue
  | DocSchemaFieldSelectTextMultipleValue
  | DocSchemaFieldSelectNumberSingleValue
  | DocSchemaFieldSelectNumberMultipleValue

/**
 * リレーション型フィールド
 */
export type DocSchemaFieldRelationTypes =
  | DocSchemaFieldRelationSingleValue
  | DocSchemaFieldRelationMultipleValue

/**
 * 複数値型フィールド（multi-*系）
 */
export type DocSchemaFieldMultipleTypes =
  | DocSchemaFieldTextMultipleValue
  | DocSchemaFieldNumberMultipleValue
  | DocSchemaFieldBooleanMultipleValue
  | DocSchemaFieldSelectTextMultipleValue
  | DocSchemaFieldSelectNumberMultipleValue
  | DocSchemaFieldRelationMultipleValue

/**
 * 単一値型フィールド
 */
export type DocSchemaFieldSingleTypes =
  | DocSchemaFieldTextSingleValue
  | DocSchemaFieldNumberSingleValue
  | DocSchemaFieldBooleanSingleValue
  | DocSchemaFieldSelectTextSingleValue
  | DocSchemaFieldSelectNumberSingleValue
  | DocSchemaFieldRelationSingleValue

/**
 * スキーマフィールドの型共用体
 */
export type DocSchemaFieldValue =
  | DocSchemaFieldTextTypes
  | DocSchemaFieldNumberTypes
  | DocSchemaFieldBooleanTypes
  | DocSchemaFieldSelectTypes
  | DocSchemaFieldRelationTypes
