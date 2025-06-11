import type { SchemaDefinition, SchemaField } from "@/lib/types"
import { z } from "zod"

/**
 * スキーマ定義からZodスキーマを動的に生成するクラス
 */
// biome-ignore lint/complexity/noStaticOnlyClass: ユーティリティクラスとして使用
export class SchemaParser {
  /**
   * スキーマ定義からZodスキーマを作成
   */
  static createZodSchemaFromDefinition(schemaDef: SchemaDefinition) {
    if (!schemaDef) {
      return z.object({})
    }

    const zodSchema: Record<string, z.ZodTypeAny> = {}

    for (const [fieldName, fieldDef] of Object.entries(schemaDef)) {
      const typedFieldDef = fieldDef as SchemaField
      let fieldSchema: z.ZodTypeAny

      switch (typedFieldDef.type) {
        case "string":
          fieldSchema = z.string()
          break
        case "number":
          fieldSchema = z.number()
          break
        case "boolean":
          fieldSchema = z.boolean()
          break
        case "array-string":
          fieldSchema = z.array(z.string())
          break
        case "array-number":
          fieldSchema = z.array(z.number())
          break
        case "array-boolean":
          fieldSchema = z.array(z.boolean())
          break
        case "relation":
          fieldSchema = z.string().nullable()
          break
        case "array-relation":
          fieldSchema = z.array(z.string())
          break
        default:
          throw new Error(
            `Unknown field type: ${String((typedFieldDef as { type?: string }).type)}`,
          )
      }

      // requiredフィールドの処理
      if (typedFieldDef.required === false) {
        fieldSchema = fieldSchema.nullable()
      }

      zodSchema[fieldName] = fieldSchema
    }

    return z.object(zodSchema)
  }

  /**
   * データをスキーマで検証
   */
  static validateWithSchema(
    data: unknown,
    schemaDef: SchemaDefinition,
  ): { success: boolean; data?: unknown; error?: z.ZodError } {
    try {
      const zodSchema = SchemaParser.createZodSchemaFromDefinition(schemaDef)
      const result = zodSchema.parse(data)
      return { success: true, data: result }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error }
      }
      throw error
    }
  }

  /**
   * スキーマ定義の妥当性をチェック
   */
  static validateSchemaDefinition(schemaDef: SchemaDefinition): boolean {
    if (!schemaDef || typeof schemaDef !== "object") {
      return false
    }

    for (const [fieldName, fieldDef] of Object.entries(schemaDef)) {
      if (!fieldName || typeof fieldName !== "string") {
        return false
      }

      const typedFieldDef = fieldDef as SchemaField
      if (!typedFieldDef.type || typeof typedFieldDef.type !== "string") {
        return false
      }

      const validTypes = [
        "string",
        "number",
        "boolean",
        "array-string",
        "array-number",
        "array-boolean",
        "relation",
        "array-relation",
      ]

      if (!validTypes.includes(typedFieldDef.type)) {
        return false
      }
    }

    return true
  }

  /**
   * スキーマフィールドからデフォルト値を取得
   */
  static getDefaultValue(fieldDef: SchemaField): unknown {
    if (fieldDef.default !== undefined) {
      return fieldDef.default
    }

    switch (fieldDef.type) {
      case "string":
        return ""
      case "number":
        return 0
      case "boolean":
        return false
      case "array-string":
      case "array-number":
      case "array-boolean":
      case "array-relation":
        return []
      case "relation":
        return null
      default:
        return null
    }
  }

  /**
   * スキーマ定義からデフォルトデータオブジェクトを生成
   */
  static createDefaultData(
    schemaDef: SchemaDefinition,
  ): Record<string, unknown> {
    if (!schemaDef) {
      return {}
    }

    const defaultData: Record<string, unknown> = {}

    for (const [fieldName, fieldDef] of Object.entries(schemaDef)) {
      const typedFieldDef = fieldDef as SchemaField
      defaultData[fieldName] = SchemaParser.getDefaultValue(typedFieldDef)
    }

    return defaultData
  }
}
