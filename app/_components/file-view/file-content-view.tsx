"use client"

import { saveFileContent } from "@/app/_actions/save-file-content"
import { CsvFileView } from "@/app/_components/file-view/csv-file-view"
import { MarkdownFileView } from "@/app/_components/file-view/markdown-file-view"
import { useState } from "react"
import { DefaultFileViewer } from "./default-file-view"
import { JsonFileEditor } from "./json-file-editor"

type Props = {
  content: string
  filePath: string
}

export function FileContentView(props: Props) {
  const [currentContent, setCurrentContent] = useState(props.content)

  // ファイル内容を保存する関数
  const onChange = async (newContent: string) => {
    try {
      // Server Actionを呼び出し
      const result = await saveFileContent({
        filePath: props.filePath,
        content: newContent,
      })

      if (!result.success) {
        console.error("Failed to save file:", result.error)
      } else if (result.content) {
        // Server Actionから返された内容で状態を更新
        setCurrentContent(result.content)
      }
    } catch (error) {
      console.error("Error saving file:", error)
    }
  }

  if (props.filePath.endsWith(".md")) {
    return (
      <MarkdownFileView
        fileName={props.filePath}
        content={currentContent}
        onChange={onChange}
      />
    )
  }

  if (props.filePath.endsWith(".csv")) {
    return (
      <CsvFileView
        fileName={props.filePath}
        content={currentContent}
        onChange={onChange}
      />
    )
  }

  if (props.filePath.endsWith(".json")) {
    return <JsonFileEditor content={currentContent} />
  }

  // その他のファイルタイプ
  return <DefaultFileViewer content={currentContent} />
}
