/**
 * テキストをドットで分解してパスに変換する関数
 * 例: "projects.$project.upload" => ["projects", ":project", "upload"]
 */
export function parsePagePath(pagePath: string): string[] {
  const texts = pagePath.split(".")

  return texts.map((segment) => {
    if (segment.startsWith("$")) {
      return `:${segment.slice(1)}`
    }
    if (segment === "index") {
      return ""
    }
    return segment
  })
}
