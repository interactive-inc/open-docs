"use client"
import { ExternalLink } from "lucide-react"
import { useClientLoading } from "../hooks/use-client-loading"
import { getVSCodeLink } from "../utils/get-vscode-link"
import { Button } from "./ui/button"

type Props = {
  cwd: string
  featureId: string
}

export function VscodeButton(props: Props) {
  const isLoading = useClientLoading()

  if (isLoading) {
    return null
  }

  const href = getVSCodeLink(props.featureId, props.cwd)

  return (
    <a href={href} className="block">
      <Button size={"sm"} variant={"secondary"}>
        <ExternalLink />
      </Button>
    </a>
  )
}
