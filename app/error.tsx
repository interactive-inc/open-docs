"use client"

import { useEffect } from "react"

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error(props: Props) {
  useEffect(() => {
    console.error("Application Error:", props.error)
  }, [props.error])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-4 font-bold text-xl">Something went wrong!</h2>
        <p className="mb-4 text-gray-600">
          {props.error.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={props.reset}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
