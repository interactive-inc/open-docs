export function toPriorityText(
  numericPriority: string,
): "low" | "medium" | "high" {
  const priorityNum = Number(numericPriority)

  if (Number.isNaN(priorityNum)) {
    throw new Error(
      `優先度は数値または文字列の数値である必要があります。${numericPriority}は無効な値です。`,
    )
  }

  if (priorityNum === 0) {
    return "high"
  }

  if (priorityNum === 1) {
    return "medium"
  }

  return "low"
}
