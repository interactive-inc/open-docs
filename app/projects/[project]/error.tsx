"use client"

import { useEffect } from "react"

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProjectError(props: Props) {
  useEffect(() => {
    console.error("Project Page Error:", props.error)
  }, [props.error])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-4 font-bold text-xl">
          プロジェクトページでエラーが発生しました
        </h2>
        <p className="mb-4 text-gray-600">
          {props.error.message || "予期しないエラーが発生しました"}
        </p>
        <pre className="mb-4 rounded bg-gray-100 p-4 text-left text-sm">
          {props.error.stack}
        </pre>
        <button
          type="button"
          onClick={props.reset}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          再試行
        </button>
      </div>
    </div>
  )
}
