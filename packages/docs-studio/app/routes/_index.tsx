import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_index")({
  component: Component,
})

function Component() {
  return (
    <div className="flex flex-col items-center justify-center pt-40">
      <p className="max-w-md text-center">
        左側のサイドバーからファイルを選択してください。
        <br />
        ファイルの内容がここに表示されます。
      </p>
    </div>
  )
}
