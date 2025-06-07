import type { z } from "zod"

type Props<T = Record<string, unknown>> = {
  data: T
}

/**
 * ディレクトリのFrontMatter
 */
export class DocDirectoryFrontMatter<
  T extends object = Record<string, unknown>,
> {
  readonly data: T

  constructor(props: Props<T>) {
    this.data = props.data
  }

  /**
   * 特定のキーの値を取得
   */
  get<K extends keyof T>(key: K): T[K] | undefined {
    const data = this.data as Record<string, unknown>
    return data[key as string] as T[K] | undefined
  }

  /**
   * キーが存在するかチェック
   */
  has<K extends keyof T>(key: K): boolean {
    const data = this.data as Record<string, unknown>
    return (key as string) in data
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
   * 新しいデータでFrontMatterを更新
   */
  update(newData: Partial<T>): DocDirectoryFrontMatter<T> {
    return new DocDirectoryFrontMatter<T>({
      data: { ...this.data, ...newData } as T,
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
  static empty<
    T extends object = Record<string, unknown>,
  >(): DocDirectoryFrontMatter<T> {
    return new DocDirectoryFrontMatter<T>({
      data: {} as T,
    })
  }

  /**
   * データからFrontMatterを作成
   */
  static from<T extends object = Record<string, unknown>>(
    data: T,
  ): DocDirectoryFrontMatter<T> {
    return new DocDirectoryFrontMatter<T>({
      data,
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
