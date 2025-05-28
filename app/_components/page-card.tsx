"use client"

import type { zPage } from "../../lib/models/page"
import { Card } from "./ui/card"
import { Input } from "./ui/input"
import { VscodeButton } from "./vscode-button"

type Props = {
  page: ReturnType<typeof zPage.parse>
  featureCount: number
  cwd: string
  project: string
}

export function PageCard(props: Props) {
  return (
    <Card className="flex flex-col justify-between gap-2 p-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold">{props.page.name}</p>
        <VscodeButton cwd={props.cwd} featureId={props.page.id} />
      </div>
      <div>
        <Input value={props.page.path} />
      </div>
    </Card>
  )
}
