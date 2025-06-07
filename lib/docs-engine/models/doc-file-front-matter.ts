import type { FieldType, Schema } from "@/lib/validations/doc-schema"
import type { z } from "zod"

type Props<T = Record<string, unknown>> = {
  data: T
  schema: Schema
}

/**
 * ファイルのFrontMatter
 */
export class DocFileFrontMatter<T = Record<string, unknown>> {
  readonly data: T

  readonly schema: Schema

  constructor(props: Props<T>) {
    this.data = props.data
    this.schema = props.schema
  }

  /**
   * スキーマでバリデーションされたデータを取得
   */
  get validated(): T {
    return this.applySchemaDefaults(
      this.data as Record<string, unknown>,
      this.schema,
    ) as T
  }

  /**
   * 特定のキーの値を取得
   */
  get<K extends keyof T>(key: K): T[K] | undefined {
    const validated = this.validated as Record<string, unknown>
    return validated[key as string] as T[K] | undefined
  }

  /**
   * キーが存在するかチェック
   */
  has<K extends keyof T>(key: K): boolean {
    const validated = this.validated as Record<string, unknown>
    return (key as string) in validated
  }

  /**
   * 指定されたキーの文字列値を取得
   */
  private getStringValue(key: string): string | null {
    const data = this.data as Record<string, unknown>
    const value = data[key] as string | undefined
    return value || null
  }

  /**
   * タイトルを取得
   */
  get title(): string | null {
    return this.getStringValue("title")
  }

  /**
   * 説明を取得
   */
  get description(): string | null {
    return this.getStringValue("description")
  }

  /**
   * アイコンを取得
   */
  get icon(): string | null {
    return this.getStringValue("icon")
  }

  /**
   * スキーマからデフォルト値を適用
   */
  private applySchemaDefaults(
    data: Record<string, unknown>,
    schema: Schema,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = { ...data }

    for (const [key, fieldSchema] of Object.entries(schema)) {
      if (!(key in result)) {
        if (fieldSchema.required === true) {
          result[key] = this.getDefaultValue(fieldSchema.type)
        } else {
          result[key] = null
        }
      }
    }

    return result
  }

  /**
   * 型に応じたデフォルト値を取得
   */
  private getDefaultValue(type: FieldType): unknown {
    if (type === "string") {
      return ""
    }
    if (type === "number") {
      return 0
    }
    if (type === "boolean") {
      return false
    }
    if (
      type === "array" ||
      type === "array-string" ||
      type === "array-number" ||
      type === "array-boolean"
    ) {
      return []
    }
    return null
  }

  /**
   * 新しいデータでFrontMatterを更新
   */
  update(newData: Partial<T>): DocFileFrontMatter<T> {
    return new DocFileFrontMatter<T>({
      data: { ...this.data, ...newData } as T,
      schema: this.schema,
    })
  }

  /**
   * 新しいスキーマでFrontMatterを作成
   */
  withSchema<U = Record<string, unknown>>(
    schema: Schema,
  ): DocFileFrontMatter<U> {
    return new DocFileFrontMatter<U>({
      data: this.data as unknown as U,
      schema,
    })
  }

  /**
   * Zodスキーマでバリデーション
   */
  validateWith<U>(
    zodSchema: z.ZodSchema<U>,
  ): { success: true; data: U } | { success: false; error: z.ZodError } {
    const result = zodSchema.safeParse(this.data)
    if (result.success) {
      return { success: true, data: result.data }
    }
    return { success: false, error: result.error }
  }

  /**
   * 空のFrontMatterを作成
   */
  static empty<T = Record<string, unknown>>(
    schema: Schema = {},
  ): DocFileFrontMatter<T> {
    return new DocFileFrontMatter<T>({
      data: {} as T,
      schema,
    })
  }

  /**
   * データからFrontMatterを作成
   */
  static from<T = Record<string, unknown>>(
    data: T,
    schema: Schema = {},
  ): DocFileFrontMatter<T> {
    return new DocFileFrontMatter<T>({
      data,
      schema,
    })
  }

  /**
   * null値を除去したデータを返す
   */
  get cleaned(): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    const data = this.data as Record<string, unknown>

    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        result[key] = value
      }
    }

    return result
  }
}
