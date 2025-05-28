import { parse } from "yaml"

export function parseFrontMatterContent(frontMatterText: string) {
  return parse(frontMatterText)
}
