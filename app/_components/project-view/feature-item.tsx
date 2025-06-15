"use client"

import { SingleRelationSelect } from "@/app/_components/file-view/single-relation-select"
import { Button } from "@/app/_components/ui/button"
import type { DirectoryFile, RelationOption } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CheckCircle, X } from "lucide-react"

type Priority = "high" | "medium" | "low"

type Props = {
  feature: DirectoryFile
  milestoneOptions?: RelationOption[]
  onMilestoneUpdate?: (featurePath: string, milestone: string) => void
  onPropertyUpdate?: (
    featurePath: string,
    field: string,
    value: unknown,
  ) => void
  onFeatureRemove?: (featurePath: string) => void
}

export function FeatureItem(props: Props) {
  const frontMatter = props.feature.frontMatter as Record<string, unknown>
  const isDone = (frontMatter?.["is-done"] as boolean) === true
  const priorityNumber = (frontMatter?.priority as number) || 0
  const priority =
    priorityNumber === 2 ? "high" : priorityNumber === 1 ? "medium" : "low"
  const milestone = frontMatter?.milestone as string

  const getCurrentValue = () => {
    const matchingOption = props.milestoneOptions?.find(
      (option) => option.label === milestone,
    )
    return matchingOption?.value || ""
  }

  const handleMilestoneChange = (value: string) => {
    if (!value) {
      props.onMilestoneUpdate?.(props.feature.path || "", "")
      return
    }

    const selectedOption = props.milestoneOptions?.find(
      (option) => option.value === value,
    )
    const labelToSave = selectedOption?.label || value
    props.onMilestoneUpdate?.(props.feature.path || "", labelToSave)
  }

  const handleDoneToggle = () => {
    props.onPropertyUpdate?.(props.feature.path || "", "is-done", !isDone)
  }

  const handlePriorityClick = () => {
    const currentValue = (frontMatter?.priority as number) || 0
    const nextValue = (currentValue + 1) % 3
    props.onPropertyUpdate?.(props.feature.path || "", "priority", nextValue)
  }

  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case "high":
        return "border-red-500"
      case "medium":
        return "border-yellow-500"
      case "low":
        return "border-green-500"
      default:
        return "border-gray-500"
    }
  }

  const getPriorityLabel = (priority: Priority): string => {
    switch (priority) {
      case "high":
        return "2"
      case "medium":
        return "1"
      case "low":
        return "0"
      default:
        return "0"
    }
  }

  return (
    <div className={`rounded-lg border p-3 ${isDone ? "opacity-75" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Button
                variant={isDone ? "default" : "secondary"}
                size="sm"
                onClick={handleDoneToggle}
              >
                <CheckCircle className="size-4" />
              </Button>
              <h3
                className={`font-bold ${isDone ? "line-through opacity-80" : ""}`}
              >
                {props.feature.title || props.feature.fileName}
              </h3>
            </div>
          </div>
          {props.feature.description && (
            <p className="mb-2 text-sm opacity-80">
              {props.feature.description}
            </p>
          )}
          <div className="flex items-end justify-between">
            <div className="text-gray-500 text-xs">
              {props.feature.fileName}
            </div>
            <div className="flex gap-2">
              <SingleRelationSelect
                value={getCurrentValue()}
                relationOptions={props.milestoneOptions || []}
                onValueChange={handleMilestoneChange}
              />
              <Button
                variant="outline"
                className={cn("w-8", getPriorityColor(priority))}
                onClick={handlePriorityClick}
              >
                {getPriorityLabel(priority)}
              </Button>
              {props.onFeatureRemove && (
                <Button
                  variant="outline"
                  className="w-8"
                  onClick={() =>
                    props.onFeatureRemove?.(props.feature.path || "")
                  }
                >
                  <X className="size-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
