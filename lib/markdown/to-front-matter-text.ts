import { stringify } from "yaml"

export function toFrontMatterText(frontMatter: Record<string, unknown>) {
  // FrontMatterの順序を指定
  const orderedKeys = ["icon", "title", "description", "schema"]
  const orderedFrontMatter: Record<string, unknown> = {}

  // 指定した順序で追加
  for (const key of orderedKeys) {
    if (key in frontMatter) {
      orderedFrontMatter[key] = frontMatter[key]
    }
  }

  // 残りのキーを追加
  for (const [key, value] of Object.entries(frontMatter)) {
    if (!orderedKeys.includes(key)) {
      orderedFrontMatter[key] = value
    }
  }

  return stringify(orderedFrontMatter).trim()
}
