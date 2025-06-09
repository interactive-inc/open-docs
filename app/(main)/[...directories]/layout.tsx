import { Suspense } from "react"

type Props = {
  children: React.ReactNode
}

export default function Layout(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-muted-foreground">読み込み中...</div>
        </div>
      }
    >
      {props.children}
    </Suspense>
  )
}
