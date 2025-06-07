"use client"

import { useRemoveFeatureFromPage } from "@/lib/hooks/use-remove-feature"
import {
  useUpdateFeaturePriority,
  useUpdateFeatureStatus,
} from "@/lib/hooks/use-update-feature"
import { Check, CircleDashed, Loader2 } from "lucide-react"
import { useState } from "react"
import type { zFeature } from "../../lib/models/feature"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { VscodeButton } from "./vscode-button"

type Props = {
  feature: ReturnType<typeof zFeature.parse>
  pageId: string
  cwd: string
  project: string
}

export function FeatureCard(props: Props) {
  const [featureStatus, setFeatureStatus] = useState(props.feature.isDone)
  const [featurePriority, setFeaturePriority] = useState(props.feature.primary)

  const updateStatus = useUpdateFeatureStatus()
  const updatePriority = useUpdateFeaturePriority()
  const removeFeature = useRemoveFeatureFromPage()

  const toggleFeatureStatus = async () => {
    try {
      const newStatus = !featureStatus

      await updateStatus.mutateAsync({
        featureId: props.feature.id,
        isDone: newStatus,
        project: props.project,
      })

      setFeatureStatus(newStatus)
    } catch (error) {
      console.error("ステータス更新エラー:", error)
    }
  }

  const toggleFeaturePriority = async () => {
    try {
      const priorities = ["high", "medium", "low"] as const
      const currentIndex = priorities.indexOf(
        featurePriority as "high" | "medium" | "low",
      )
      const nextIndex = (currentIndex + 1) % priorities.length
      const newPriority = priorities[nextIndex]

      await updatePriority.mutateAsync({
        featureId: props.feature.id,
        primary: newPriority as "high" | "medium" | "low",
        project: props.project,
      })

      setFeaturePriority(newPriority || "low")
    } catch (error) {
      console.error("優先度更新エラー:", error)
    }
  }

  const handleRemoveFeature = async () => {
    if (
      !confirm(
        `${props.feature.name} をこのページから削除してもよろしいですか？`,
      )
    ) {
      return
    }

    try {
      await removeFeature.mutateAsync({
        pageId: props.pageId,
        featureId: props.feature.id,
        project: props.project,
      })
    } catch (error) {
      console.error("機能削除エラー:", error)
    }
  }

  const isUpdating = updateStatus.isPending
  const isPriorityUpdating = updatePriority.isPending
  const isRemoving = removeFeature.isPending

  return (
    <Card className="gap-y-2 overflow-hidden p-2">
      <div>
        <p className="truncate font-bold text-lg">{props.feature.name}</p>
        <p className="truncate font-mono text-gray-500 text-xs">
          {props.feature.id}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size={"sm"}
            variant={featureStatus ? "default" : "secondary"}
            onClick={toggleFeatureStatus}
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            {isUpdating ? (
              <Loader2 className="animate-spin" />
            ) : featureStatus ? (
              <Check />
            ) : (
              <CircleDashed />
            )}
          </Button>
          <Button
            onClick={toggleFeaturePriority}
            size={"sm"}
            variant={
              featurePriority === "high"
                ? "default"
                : featurePriority === "medium"
                  ? "secondary"
                  : "secondary"
            }
            disabled={isPriorityUpdating}
            className="gap-1.5"
          >
            {isPriorityUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `優先度:${
                featurePriority === "high"
                  ? "高"
                  : featurePriority === "medium"
                    ? "中"
                    : "低"
              }`
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <VscodeButton
            featureId={props.feature.id}
            cwd={props.cwd}
            size="sm"
            variant="secondary"
          />
          <Button
            onClick={handleRemoveFeature}
            size={"sm"}
            variant={"destructive"}
            disabled={isRemoving}
            className="gap-1.5"
          >
            {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : "削除"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
