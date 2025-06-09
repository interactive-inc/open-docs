"use client"

import { DirectoryPageView } from "@/app/_components/directory-page-view"
import { FilePageView } from "@/app/_components/file-view/file-page-view"
import { useParams } from "next/navigation"

export default function Page() {
  const params = useParams<{ directories: string[] }>()

  const currentPath = params.directories.join("/")

  const supportedExtensions = [".md", ".csv", ".json", ".mermaid"]

  const isFile = supportedExtensions.some((ext) => currentPath.endsWith(ext))

  if (isFile) {
    return <FilePageView filePath={currentPath} />
  }

  return <DirectoryPageView key={currentPath} currentPath={currentPath} />
}
