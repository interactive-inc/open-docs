"use client"

import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"
import { CheckCircle, Clock } from "lucide-react"
import type { DirectoryFile } from "@/system/types"

type Priority = "high" | "medium" | "low"

type Props = {
  feature: DirectoryFile
}

export function FeatureItem(props: Props) {
  const isDone = (props.feature.frontMatter?.["is-done"] as boolean) === true
  const priority = (props.feature.frontMatter?.priority as Priority) || "low"
  const milestone = props.feature.frontMatter?.milestone as string

  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (isDone: boolean) => {
    return isDone ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <Clock className="h-4 w-4 text-gray-400" />
    )
  }

  const getPriorityLabel = (priority: Priority): string => {
    switch (priority) {
      case "high": return "高"
      case "medium": return "中"
      case "low": return "低"
      default: return "低"
    }
  }

  return (
    <div
      className={`rounded-lg border p-3 ${isDone ? "opacity-75" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Button 
              variant={isDone ? "default" : "secondary"} 
              size="icon"
              className="h-6 w-6"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
            <h3
              className={`font-medium ${isDone ? "text-gray-600 line-through" : ""}`}
            >
              {props.feature.title || props.feature.fileName}
            </h3>
            <Badge className={getPriorityColor(priority)}>
              {getPriorityLabel(priority)}
            </Badge>
            {milestone && (
              <Badge variant="outline">
                {milestone}
              </Badge>
            )}
          </div>

          {props.feature.description && (
            <p className="mb-2 text-gray-600 text-sm">
              {props.feature.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="text-gray-500 text-xs">
              {props.feature.fileName}
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm">
                編集
              </Button>
              <Button variant="ghost" size="sm">
                詳細
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}