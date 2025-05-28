import { stringify } from "yaml"

export function toFrontMatterText(frontMatter: Record<string, unknown>) {
  return stringify(frontMatter)
}
