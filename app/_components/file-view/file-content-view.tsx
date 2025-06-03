"use client"

import { CsvFileView } from "@/app/_components/file-view/csv-file-view"
import { MarkdownFileView } from "@/app/_components/file-view/markdown-file-view"
import { ReloadButton } from "@/app/_components/reload-button"
import { SidebarButton } from "@/app/_components/sidebar-button"
import { Input } from "@/app/_components/ui/input"
import { VscodeButton } from "@/app/_components/vscode-button"
import { useFileContent } from "@/lib/hooks/use-file-content"
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
  const fileContentQuery = useFileContent(props.filePath)

  const onChange = async (newContent: string) => {
    const result = await saveFileContent.mutateAsync({
      filePath: props.filePath,
      content: newContent,
    })
    if ("content" in result) {
      setCurrentContent(result.content)
    }
  }

  const handleReload = () => {
    fileContentQuery.refetch().then((result) => {
      if (result.data?.content) {
        setCurrentContent(result.data.content)
      }
    })
  }

  // ファイル名を取得
  const getFileName = () => {
    return props.filePath.split("/").pop() || ""
  }

  return (
    <div className="space-y-2 p-4">
      <div className="flex items-center gap-2">
        <SidebarButton />
        <VscodeButton
          cwd="/Users/n/Documents/open-docs"
          filePath={props.filePath}
          size="icon"
          variant="outline"
        />
        <Input value={getFileName()} readOnly className="flex-1" />
        <ReloadButton
          onReload={handleReload}
          size="icon"
          variant="outline"
          disabled={fileContentQuery.isLoading}
        />
      </div>
      <div className="h-full">
        {props.filePath.endsWith(".md") && (
          <MarkdownFileView
            fileName={props.filePath}
            content={currentContent}
            onChange={onChange}
          />
        )}
        {props.filePath.endsWith(".csv") && (
          <CsvFileView
            fileName={props.filePath}
            content={currentContent}
            onChange={onChange}
          />
        )}
        {props.filePath.endsWith(".json") && (
          <JsonFileEditor content={currentContent} />
        )}
        {!props.filePath.endsWith(".md") &&
          !props.filePath.endsWith(".csv") &&
          !props.filePath.endsWith(".json") && (
            <DefaultFileViewer content={currentContent} />
          )}
      </div>
    </div>
  )
}
