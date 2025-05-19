/**
 * オブジェクトをフロントマターテキストに変換
 */
export function toFrontMatterText(obj: Record<string, unknown>): string {
  const lines: string[] = []

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}:`)
      } else {
        lines.push(`${key}:`)
        for (const item of value) {
          lines.push(`  - ${item}`)
        }
      }
    } else {
      lines.push(`${key}: ${value}`)
    }
  }

  return lines.join("\n")
}
