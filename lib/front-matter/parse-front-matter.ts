import type { z } from "zod"
import { extractFrontMatterText } from "./extract-front-matter-text"
import { parseFrontMatterContent } from "./parse-front-matter-content"

// スキーマの型を柔軟にする
type Props<T, S extends z.ZodTypeAny = z.ZodType<T>> = {
  text: string
  schema: S
}

type Result<T> = {
  data: T
  content: string
}

export function parseFrontMatter<T, S extends z.ZodTypeAny = z.ZodType<T>>(
  props: Props<T, S>,
): Result<T> {
  const { frontMatterText, contentText } = extractFrontMatterText(props.text)

  if (frontMatterText === null) {
    throw new Error("Front matter not found")
  }

  // パース済みの内容を取得
  const rawData = parseFrontMatterContent(frontMatterText)

  // スキーマを使って検証
  const parsedData = props.schema.parse(rawData)

  return {
    data: parsedData as T,
    content: contentText.trim(),
  }
}
