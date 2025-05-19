/**
 * フロントマターテキストをオブジェクトに変換
 */

type ParseResult = Record<string, string | string[]>

type State = {
  result: ParseResult
  currentKey: string | null
  inArrayMode: boolean
}

/**
 * フロントマターテキストをオブジェクトに変換（状態機械を使ったシンプルな実装）
 * @param frontMatterText フロントマターのテキスト
 * @returns パース結果のオブジェクト
 */
export function parseFrontMatterContent(frontMatterText: string): ParseResult {
  if (!frontMatterText) {
    return {}
  }

  const lines = frontMatterText.split("\n")

  let state: State = {
    result: {},
    currentKey: null,
    inArrayMode: false,
  }

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (trimmedLine === "") {
      continue
    }

    if (trimmedLine.includes(":")) {
      state = parseKeyValueLine(trimmedLine, state)
    } else if (
      state.inArrayMode &&
      trimmedLine.startsWith("-") &&
      state.currentKey
    ) {
      state = addArrayItem(trimmedLine, state)
    }
  }

  return state.result
}

/**
 * フロントマターテキストをオブジェクトに変換（別の実装方法、旧parse-front-matter-to-object.tsの実装）
 * @param frontMatterText フロントマターのテキスト
 * @returns パース結果のオブジェクト
 * @deprecated parseFrontMatterContent を使用してください
 */
export function parseFrontMatterToObject(
  frontMatterText: string,
): Record<string, unknown> {
  const lines = frontMatterText.trim().split("\n")
  const result: Record<string, unknown> = {}

  let currentKey: string | null = null
  let isArray = false
  let arrayValues: string[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (trimmedLine === "") continue

    // キー/値のペアを検出
    if (trimmedLine.includes(":")) {
      // 新しいキー/値ペアの開始
      // 前の配列があれば保存
      if (currentKey !== null && isArray) {
        result[currentKey] = arrayValues
        arrayValues = []
        isArray = false
      }

      const [key, value] = trimmedLine.split(":", 2)

      // キーがundefinedでないことを確認
      if (!key) continue

      currentKey = key.trim()

      const trimmedValue = value?.trim()

      if (!trimmedValue || trimmedValue === "") {
        // 値がない場合は配列の開始と見なす
        isArray = true
        arrayValues = []
      } else {
        // 値がある場合は通常のキー/値ペア
        result[currentKey] = trimmedValue
        currentKey = null
        isArray = false
      }
    } else if (isArray && currentKey !== null && trimmedLine.startsWith("-")) {
      // 配列アイテムを検出
      const arrayItem = trimmedLine.substring(1).trim()
      arrayValues.push(arrayItem)
    }
  }

  // 最後の配列があれば保存
  if (currentKey !== null && isArray) {
    result[currentKey] = arrayValues
  }

  return result
}

function parseKeyValueLine(line: string, state: State): State {
  const parts = line.split(":", 2)

  if (parts.length === 0) {
    return state
  }

  const key = parts[0]?.trim() || ""
  const value = parts.length > 1 && parts[1] ? parts[1].trim() : ""

  if (value === "") {
    return {
      ...state,
      result: { ...state.result, [key]: [] },
      currentKey: key,
      inArrayMode: true,
    }
  }

  return {
    ...state,
    result: { ...state.result, [key]: value },
    currentKey: key,
    inArrayMode: false,
  }
}

function addArrayItem(line: string, state: State): State {
  const { result, currentKey } = state
  if (!currentKey) return state

  const arrayItem = line.slice(1).trim()
  const currentValue = result[currentKey]

  if (!Array.isArray(currentValue)) {
    return state
  }

  return {
    ...state,
    result: {
      ...result,
      [currentKey]: [...currentValue, arrayItem],
    },
  }
}
