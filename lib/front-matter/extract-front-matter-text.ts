type Result = {
  frontMatterText: string | null
  contentText: string
}

export function extractFrontMatterText(text: string): Result {
  if (!text.startsWith("---")) {
    return {
      frontMatterText: null,
      contentText: text,
    }
  }

  // 最初の "---" を除外して開始位置を探す
  const startIndex = text.indexOf("---")

  // 2番目の "---" を探す (frontmatterの終わり)
  const endIndex = text.indexOf("---", startIndex + 3)

  if (endIndex === -1) {
    return {
      frontMatterText: null,
      contentText: text,
    }
  }

  const frontMatterText = text.slice(startIndex + 3, endIndex).trim()

  // フロントマター後の空行がある場合の特別な処理
  let contentText = text.slice(endIndex + 3)

  // フロントマターの後に空行がある場合は特別に扱う
  if (text.slice(endIndex + 3).startsWith("\n\n")) {
    // フロントマターの後に2つ以上の改行がある場合、改行を保持する
    contentText = `\n${text.slice(endIndex + 4).trim()}`
  } else {
    // それ以外の場合は通常通りtrim
    contentText = text.slice(endIndex + 3).trim()
  }

  contentText = `${contentText.trim()}`

  return {
    frontMatterText,
    contentText,
  }
}
