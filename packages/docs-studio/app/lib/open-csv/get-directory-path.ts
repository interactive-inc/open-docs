export function getDirectoryPath(filePath: string): string {
  const pathSegments = filePath.split("/")

  if (pathSegments[pathSegments.length - 1]?.includes(".")) {
    // 最後のセグメントがファイル名を含む場合は、ディレクトリパスから削除
    pathSegments.pop()
  }

  const directoryPath = pathSegments.join("/")

  return directoryPath
}
