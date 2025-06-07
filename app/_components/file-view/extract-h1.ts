/**
 * マークダウンからH1を抽出
 */
export function extractH1FromMarkdown(content: string): string | undefined {
  const match = content.match(/^#\s+(.+)$/m)
  return match?.[1]?.trim()
}

/**
 * マークダウンのH1を更新
 */
export function updateH1InMarkdown(content: string, newTitle: string): string {
  const h1Regex = /^#\s+.+$/m
  if (h1Regex.test(content)) {
    return content.replace(h1Regex, `# ${newTitle}`)
  }
  // H1がない場合は先頭に追加
  return `# ${newTitle}\n\n${content}`
}
