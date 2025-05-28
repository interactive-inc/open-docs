"use client"

import { useEffect, useState } from "react"

type Props = {
  content: string
}

export function JsonFileEditor(props: Props) {
  const [formattedJson, setFormattedJson] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const jsonData = JSON.parse(props.content)
      setFormattedJson(JSON.stringify(jsonData, null, 2))
      setError(null)
    } catch (e) {
      setError(
        "JSONのパースに失敗しました。有効なJSONではない可能性があります。",
      )
      setFormattedJson(props.content) // JSONのパースに失敗した場合はそのまま表示
    }
  }, [props.content])

  return (
    <div>
      {error && (
        <div className="mb-4 rounded border border-red-700 bg-red-900/30 p-2 text-red-300 text-sm">
          {error}
        </div>
      )}
      <div className="overflow-x-auto rounded bg-gray-800 p-4 text-white">
        <pre className="whitespace-pre-wrap font-mono text-green-300">
          {formattedJson}
        </pre>
      </div>
    </div>
  )
}
