"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "./ui/button"

type Props = {
  onReload: () => void
  size?: "sm" | "default" | "lg" | "icon"
  variant?: "default" | "secondary" | "ghost" | "outline"
  disabled?: boolean
}

/**
 * リロードボタンコンポーネント
 */
export function ReloadButton(props: Props) {
  return (
    <Button
      size={props.size || "sm"}
      variant={props.variant || "secondary"}
      onClick={props.onReload}
      disabled={props.disabled}
    >
      <RefreshCw />
    </Button>
  )
}
