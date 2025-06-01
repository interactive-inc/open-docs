"use client"

import { DirectoryLayoutSidebar } from "@/app/_components/directory-layout-sidebar"
import { useClientLoading } from "@/app/_hooks/use-client-loading"
import { Suspense } from "react"

type Props = {
  children: React.ReactNode
}

export default function FilesLayout(props: Props) {
  const loading = useClientLoading()

  if (loading) {
    return null
  }

  return (
    <Suspense fallback={<div>ファイルツリーを読み込み中...</div>}>
      <DirectoryLayoutSidebar>{props.children}</DirectoryLayoutSidebar>
    </Suspense>
  )
}
