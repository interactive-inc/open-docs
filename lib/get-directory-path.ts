export function getDirectoryPath(filePath: string): string {
  const pathSegments = filePath.replace(/^docs\//, "").split("/")

  pathSegments.pop()

  const directoryPath = pathSegments.join("/")

  return directoryPath
}
