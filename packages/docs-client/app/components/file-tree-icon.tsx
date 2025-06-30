import {
  FileIcon,
  FileJsonIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
} from "lucide-react"

type Props = {
  fileName: string
}

export function FileTreeIcon(props: Props) {
  if (props.fileName.endsWith(".md")) {
    return <FileTextIcon size={16} className="mr-2 text-green-400" />
  }

  if (props.fileName.endsWith(".csv")) {
    return <FileSpreadsheetIcon size={16} className="mr-2 text-purple-400" />
  }

  if (props.fileName.endsWith(".json")) {
    return <FileJsonIcon size={16} className="mr-2 text-yellow-400" />
  }

  return <FileIcon size={16} className="mr-2 text-blue-400" />
}
