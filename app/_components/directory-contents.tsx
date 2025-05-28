"use client"

import { GetFileIcon } from "@/app/_components/get-file-icon"
import type { FileNode } from "@/lib/get-docs-files"
import { ChevronRightIcon, FolderIcon } from "lucide-react"
import Link from "next/link"

type Props = {
  files: FileNode[]
  currentPath: string
}

export function DirectoryContents(props: Props) {
  const formatPath = (path: string) => {
    return path.replace(/^docs\//, "")
  }

  const getCurrentDirectoryContents = (
    files: FileNode[],
    dirPath: string,
  ): FileNode[] => {
    console.log("Incoming dirPath:", dirPath)
    console.log(
      "Files in top level:",
      files.map((f) => f.name),
    )

    // トップレベルのファイルを返す場合
    if (!dirPath || dirPath === "") {
      return files
    }

    // パスの処理
    // URL から来るパスは `notes` のような形式
    const parts = dirPath.split("/").filter(Boolean)
    console.log("Path parts:", parts)

    // トップレベルから順に探していく
    let currentLevel = files

    for (const part of parts) {
      console.log("Looking for directory:", part)
      console.log(
        "Current level items:",
        currentLevel.map((f) => f.name),
      )

      // 現在の階層から該当するディレクトリを探す
      const directory = currentLevel.find(
        (item) => item.type === "directory" && item.name === part,
      )

      console.log("Found directory:", directory?.name)

      // ディレクトリが見つからないか、子要素がない場合は空配列を返す
      if (!directory || !directory.children) {
        console.log("Directory not found or has no children")
        return []
      }

      // 次の階層へ進む
      currentLevel = directory.children
    }

    // 見つかったディレクトリの子要素を返す
    console.log(
      "Returning contents:",
      currentLevel.map((f) => f.name),
    )
    return currentLevel
  }

  const contents = getCurrentDirectoryContents(props.files, props.currentPath)
  console.log("Final contents:", contents)

  return (
    <div className="p-4">
      <h1 className="mb-4 font-bold text-xl">{`${props.currentPath || "/"} の内容`}</h1>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {contents.map((item) => (
          <div
            key={item.path}
            className="flex items-center rounded border border-gray-200 p-3 hover:bg-gray-50"
          >
            {item.type === "directory" ? (
              <Link
                href={`/directories/${formatPath(item.path)}`}
                className="flex w-full items-center gap-2"
              >
                <FolderIcon className="h-5 w-5 text-blue-500" />
                <span>{item.name}</span>
                <ChevronRightIcon className="ml-auto h-4 w-4 text-gray-400" />
              </Link>
            ) : (
              <Link
                href={`/files/${formatPath(item.path)}`}
                className="flex w-full items-center gap-2"
              >
                <GetFileIcon fileName={item.name} />
                <span>{item.name}</span>
              </Link>
            )}
          </div>
        ))}

        {contents.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            このディレクトリには何もありません
          </div>
        )}
      </div>
    </div>
  )
}
