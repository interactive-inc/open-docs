export function extractHeading(content: string): string {
  const titleMatch = content.match(/^#\s+(.*?)$/m)

  if (!titleMatch || !titleMatch[1]) {
    throw new Error(
      "H1見出しが見つかりません。マークダウンファイルには必ずH1見出しを含めてください。",
    )
  }

  return titleMatch[1].trim()
}
