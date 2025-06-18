import { Card } from "@/components/ui/card"
import type { DocFileUnknown } from "@/lib/types"
import { FileCard } from "./file-card"

type Props = {
  files: DocFileUnknown[]
  onDataChanged?: () => void
}

export function DirectoryFileListView(props: Props) {
  if (!props.files || props.files.length === 0) {
    return null
  }

  return (
    <Card className="rounded-md p-2">
      <div className="space-y-2">
        {props.files.map((file) => (
          <FileCard
            key={file.path}
            file={file}
            onDataChanged={props.onDataChanged}
          />
        ))}
      </div>
    </Card>
  )
}
