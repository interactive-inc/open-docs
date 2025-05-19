"use client"

import { Button } from "@/app/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

type Props = {
  children: React.ReactNode
  params: { project: string }
}

export default function ProjectLayout(props: Props) {
  const params = props.params

  console.log("params", params)

  const pathname = usePathname()

  const isPagesList = pathname === `/projects/${params.project}`

  const isMilestones = pathname === `/projects/${params.project}/milestones`

  return (
    <div className="mx-auto space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div />
        <nav className="flex space-x-2">
          <Link href={`/projects/${params.project}`}>
            <Button variant={isPagesList ? "default" : "secondary"}>
              ページ一覧
            </Button>
          </Link>
          <Link href={`/projects/${params.project}/milestones`}>
            <Button variant={isMilestones ? "default" : "secondary"}>
              マイルストーン
            </Button>
          </Link>
        </nav>
      </div>
      {props.children}
    </div>
  )
}
