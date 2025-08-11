import { createFileRoute, useLocation } from "@tanstack/react-router"
import { DirectoryPageView } from "@/components/directory-page-view"
import { FilePageView } from "@/components/file-view/file-page-view"

export const Route = createFileRoute("/$/")({
  component: Component,
})

function Component() {
  const pathname = useLocation({ select: (location) => location.pathname })

  const supportedExtensions = [".md", ".csv", ".json", ".mermaid"]

  const isFile = supportedExtensions.some((ext) => pathname.endsWith(ext))

  if (pathname.startsWith("/apps")) {
    return null
  }

  const filePath = pathname.replace("/", "")

  if (isFile) {
    return <FilePageView filePath={filePath} />
  }

  return <DirectoryPageView key={pathname} currentPath={filePath} />
}
