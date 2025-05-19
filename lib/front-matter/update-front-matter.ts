/**
 * JSONデータを使ってフロントマターを更新
 */
export function updateFrontMatter(
  currentFrontMatter: Record<string, unknown>,
  jsonData: Record<string, unknown>,
): Record<string, unknown> {
  const updatedFrontMatter = { ...currentFrontMatter }

  // 更新対象のフィールドを決定
  const fieldsToUpdate = Object.keys(jsonData)

  // 指定されたフィールドのみ更新
  for (const field of fieldsToUpdate) {
    if (field in jsonData) {
      updatedFrontMatter[field] = jsonData[field]
    }
  }

  return updatedFrontMatter
}
