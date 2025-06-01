"use client"
import { ExternalLink } from "lucide-react"
import { useClientLoading } from "../_hooks/use-client-loading"
import { getVSCodeFileLink, getVSCodeLink } from "../_utils/get-vscode-link"
import { Button } from "./ui/button"

type Props = {
  cwd: string
  featureId?: string
  filePath?: string
  size?: "sm" | "default" | "lg" | "icon"
  variant?: "default" | "secondary" | "ghost" | "outline"
}

export function VscodeButton(props: Props) {
  const isLoading = useClientLoading()

  if (isLoading) {
    return null
  }

  const href = props.filePath
    ? getVSCodeFileLink(props.filePath, props.cwd)
    : props.featureId
      ? getVSCodeLink(props.featureId, props.cwd)
      : "#"

  return (
    <a href={href} className="block">
      <Button size={props.size || "sm"} variant={props.variant || "secondary"}>
        <ExternalLink />
      </Button>
    </a>
  )
}
