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

  const onChange = async (newContent: string) => {
    const content = await saveFileContent({
      filePath: props.filePath,
      content: newContent,
    })
    setCurrentContent(content)
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
