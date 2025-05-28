type Result = {
  fileName: string
  parentPath: string
  displayName: string
}

/**
 * ファイルパスから表示名を取得する
 */
export function getDisplayName(filePathArray: string[]): Result {
  const fileName = filePathArray[filePathArray.length - 1] || ""

  const parentPath = filePathArray.slice(0, -1).join("/")

  const displayName = fileName.includes(".")
    ? fileName.substring(0, fileName.lastIndexOf("."))
    : fileName

  return {
    fileName,
    parentPath,
    displayName,
  }
}
