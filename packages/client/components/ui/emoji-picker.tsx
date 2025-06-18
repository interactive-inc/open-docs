"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Props = {
  currentIcon?: string
  onIconSelect: (icon: string) => void
}

const EMOJI_LIST = [
  "📁",
  "📂",
  "📄",
  "📝",
  "📊",
  "📈",
  "📉",
  "📋",
  "📌",
  "📍",
  "🏠",
  "🏢",
  "🏪",
  "🏬",
  "🏭",
  "🏯",
  "🏰",
  "🏳️",
  "🏴",
  "🏁",
  "⚡",
  "🔥",
  "💧",
  "🌱",
  "🌟",
  "⭐",
  "🎯",
  "🎪",
  "🎭",
  "🎨",
  "🔧",
  "🔨",
  "⚙️",
  "🔩",
  "⚖️",
  "🔬",
  "💻",
  "📱",
  "🖥️",
  "⌨️",
  "💡",
  "🔑",
  "🗝️",
  "🔒",
  "🔓",
  "🔐",
  "🛡️",
  "⚔️",
  "🏹",
  "🎣",
  "📚",
  "📖",
  "📗",
  "📘",
  "📙",
  "📓",
  "📔",
  "📒",
  "📰",
  "📜",
  "🎵",
  "🎶",
  "🎤",
  "🎧",
  "🎸",
  "🎹",
  "🥁",
  "🎺",
  "🎷",
  "🎻",
  "🎮",
  "🕹️",
  "🎲",
  "♠️",
  "♥️",
  "♦️",
  "♣️",
  "🃏",
  "🀄",
  "📦",
]

export function EmojiPicker(props: Props) {
  const [open, setOpen] = useState(false)

  const handleEmojiSelect = (emoji: string) => {
    props.onIconSelect(emoji)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          {props.currentIcon || "📁"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogTitle>アイコンを選択</DialogTitle>
        <div className="space-y-4">
          <div className="grid max-h-64 grid-cols-10 gap-2 overflow-y-auto">
            {EMOJI_LIST.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleEmojiSelect(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
