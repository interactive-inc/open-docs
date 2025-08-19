export function getDirectoryPath(filePath: string, isFile: boolean): string {
  const pathSegments = filePath.split("/")

  if (isFile) {
    pathSegments.pop()
  }

  const directoryPath = pathSegments.join("/")

  return directoryPath
}
