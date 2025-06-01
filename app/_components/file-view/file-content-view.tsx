"use client"

import { CsvFileView } from "@/app/_components/file-view/csv-file-view"
import { MarkdownFileView } from "@/app/_components/file-view/markdown-file-view"
import { useSaveFileContent } from "@/lib/hooks/use-save-file-content"
import { useState } from "react"
import { DefaultFileViewer } from "./default-file-view"
import { JsonFileEditor } from "./json-file-editor"

type Props = {
  content: string
  filePath: string
}

export function FileContentView(props: Props) {
  const [currentContent, setCurrentContent] = useState(props.content)
  const saveFileContent = useSaveFileContent()

  const onChange = async (newContent: string) => {
    const result = await saveFileContent.mutateAsync({
      filePath: props.filePath,
      content: newContent,
    })
    if ("content" in result) {
      setCurrentContent(result.content)
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

  return <DefaultFileViewer content={currentContent} />
}
