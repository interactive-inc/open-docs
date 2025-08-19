import { useState } from "react"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Input } from "./ui/input"

type Props = {
  initialMessage?: string
}

/**
 * サンプルコンポーネント
 */
export function SampleComponent(props: Props) {
  const [message, setMessage] = useState(props.initialMessage || "")
  const [displayMessage, setDisplayMessage] = useState("")

  const handleSubmit = () => {
    if (message.trim()) {
      setDisplayMessage(message)
      setMessage("")
    }
  }

  const handleClear = () => {
    setDisplayMessage("")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>サンプルコンポーネント</CardTitle>
        <CardDescription>メッセージを入力して表示できます</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="メッセージを入力..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit()
              }
            }}
          />
          <Button onClick={handleSubmit}>送信</Button>
        </div>

        {displayMessage && (
          <div className="space-y-2">
            <div className="rounded-lg bg-gray-100 p-4">
              <p className="text-gray-700 text-sm">表示メッセージ:</p>
              <p className="mt-1 font-medium">{displayMessage}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="w-full"
            >
              クリア
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
