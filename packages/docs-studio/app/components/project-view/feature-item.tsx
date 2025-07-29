import { CheckCircle, X } from "lucide-react"
import { SingleRelationSelect } from "@/components/file-view/single-relation-select"
import { Button } from "@/components/ui/button"
import type {
  DocFileMd,
  DocRelationFile,
  FeatureCustomSchema,
} from "@/lib/types"
import { cn } from "@/lib/utils"

type Priority = "high" | "medium" | "low"

type Props = {
  feature: DocFileMd<FeatureCustomSchema>
  milestoneOptions?: DocRelationFile[]
  onMilestoneUpdate?: (featurePath: string, milestone: string) => void
  onPropertyUpdate?: (
    featurePath: string,
    field: string,
    value: unknown,
  ) => void
  onFeatureRemove?: (featurePath: string) => void
}

export function FeatureItem(props: Props) {
  const meta = props.feature.content.meta

  const isDone = meta["is-done"] === true

  const priorityNumber = meta.priority ?? 0

  const priority =
    priorityNumber === 2 ? "high" : priorityNumber === 1 ? "medium" : "low"

  const milestone = meta.milestone ?? ""

  const getCurrentValue = () => {
    const matchingOption = props.milestoneOptions?.find(
      (option) => option.label === milestone,
    )
    return matchingOption?.name || ""
  }

  const handleMilestoneChange = (value: string) => {
    if (!value) {
      props.onMilestoneUpdate?.(props.feature.path.path, "")
      return
    }

    const selectedOption = props.milestoneOptions?.find(
      (option) => option.name === value,
    )
    const labelToSave = selectedOption?.label || value
    props.onMilestoneUpdate?.(props.feature.path.path, labelToSave)
  }

  const handleDoneToggle = () => {
    props.onPropertyUpdate?.(props.feature.path.path, "is-done", !isDone)
  }

  const handlePriorityClick = () => {
    const currentValue = typeof meta.priority === "number" ? meta.priority : 0
    const nextValue = (currentValue + 1) % 3
    props.onPropertyUpdate?.(props.feature.path.path, "priority", nextValue)
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
    if (priority === "high") return "高"
    if (priority === "medium") return "中"
    return "低"
  }

  return (
    <div
      className={cn("space-y-2 rounded-md border p-2", isDone && "opacity-75")}
    >
      <div className="flex items-center gap-3">
        <Button
          variant={isDone ? "default" : "secondary"}
          size="sm"
          onClick={handleDoneToggle}
        >
          <CheckCircle className="size-4" />
        </Button>
        <h3 className={`font-bold ${isDone ? "line-through opacity-80" : ""}`}>
          {props.feature.content.title || props.feature.path.name}
        </h3>
      </div>
      {props.feature.content.description && (
        <p className="text-sm opacity-80">
          {props.feature.content.description}
        </p>
      )}
      <div className="flex flex-col items-end justify-between gap-2 lg:flex-row">
        <div className="text-xs opacity-50">{props.feature.path.name}</div>
        <div className="flex gap-2">
          <SingleRelationSelect
            value={getCurrentValue()}
            relationOptions={props.milestoneOptions}
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
              onClick={() => {
                props.onFeatureRemove?.(props.feature.path.path)
              }}
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
