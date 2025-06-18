"use client"
import { ExternalLink } from "lucide-react"
import { useClientLoading } from "@/hooks/use-client-loading"
import { getVSCodeFileLink } from "@/lib/get-vscode-link"
import { Button } from "./ui/button"

type Props = {
  cwd: string
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
    : "#"

  return (
    <a href={href} className="block">
      <Button size={props.size || "sm"} variant={props.variant || "secondary"}>
        <ExternalLink />
      </Button>
    </a>
  )
}
