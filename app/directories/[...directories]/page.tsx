import { PageView } from "@/app/_components/page-view"
import { Suspense } from "react"

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-muted-foreground">読み込み中...</div>
        </div>
      }
    >
      <PageView />
    </Suspense>
  )
}
