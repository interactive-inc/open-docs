import { ExternalLink } from "lucide-react"
import { getVSCodeFileLink } from "@/lib/get-vscode-link"
import { Button } from "./ui/button"

type Props = {
  filePath: string
  size?: "sm" | "default" | "lg" | "icon"
  variant?: "default" | "secondary" | "ghost" | "outline"
}

export function VscodeButton(props: Props) {
  const href = getVSCodeFileLink(props.filePath)

  return (
    <a href={href} className="block">
      <Button size={props.size || "sm"} variant={props.variant || "secondary"}>
        <ExternalLink />
      </Button>
    </a>
  )
}
