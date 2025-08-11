import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import type { DocFile } from "@/lib/types"
import { normalizePath } from "@/utils"

type Props = {
  file: DocFile
  onRestore: (filePath: string) => void
  isRestorePending: boolean
}

export function ArchivedFileItem(props: Props) {
  if (props.file.type !== "markdown") {
    return null
  }

  const handleRestore = () => {
    props.onRestore(props.file.path.path)
  }

  return (
    <div className="flex items-center justify-between p-2">
      <div className="flex-1">
        <Link
          to="/$"
          params={{ _splat: normalizePath(props.file.path.path) }}
          className="font-medium text-sm hover:underline"
        >
          {props.file.content.title || props.file.path.name}
        </Link>
      </div>
      <Button
        variant={"outline"}
        size={"sm"}
        onClick={handleRestore}
        disabled={props.isRestorePending}
      >
        {"復元"}
      </Button>
    </div>
  )
}
