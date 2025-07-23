import { Card } from "@/components/ui/card"
import type { DocFile, DocFileUnknown } from "@/lib/types"
import { FileCard } from "./file-card"

function isDocFileUnknown(file: DocFile): file is DocFileUnknown {
  return "extension" in file
}

type Props = {
  files: DocFile[]
  onDataChanged?: () => void
}

export function DirectoryFileListView(props: Props) {
  if (!props.files || props.files.length === 0) {
    return null
  }

  return (
    <Card className="rounded-md p-2">
      <div className="space-y-2">
        {props.files.filter(isDocFileUnknown).map((file) => (
          <FileCard
            key={file.path.path}
            file={file}
            onDataChanged={props.onDataChanged}
          />
        ))}
      </div>
    </Card>
  )
}
