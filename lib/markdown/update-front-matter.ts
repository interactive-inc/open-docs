export function updateFrontMatter(
  current: Record<string, unknown>,
  draft: Record<string, unknown>,
): Record<string, unknown> {
  const frontMatter = { ...current }

  const keys = Object.keys(draft)

  for (const field of keys) {
    if (field in draft) {
      frontMatter[field] = draft[field]
    }
  }

  return frontMatter
}
