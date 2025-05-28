"use client"

type Props = {
  content: string
}

export function DefaultFileViewer(props: Props) {
  return (
    <div className="rounded bg-gray-800 p-4 text-white">
      <pre className="whitespace-pre-wrap">{props.content}</pre>
    </div>
  )
}
