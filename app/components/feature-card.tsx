"use client"

import { Check, CircleDashed, Loader2 } from "lucide-react"
import { useState } from "react"
import type { vFeature } from "../../lib/models/feature"
import { removeFeatureFromPage } from "../actions/remove-feature-from-page"
import { updateFeaturePriority } from "../actions/update-feature-priority"
import { updateFeatureStatus } from "../actions/update-feature-status"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { VscodeButton } from "./vscode-button"

type Props = {
  feature: ReturnType<typeof vFeature.parse>
  pageId: string
  cwd: string
  project: string
}

export function FeatureCard(props: Props) {
  const [isUpdating, setIsUpdating] = useState(false)

  const [isPriorityUpdating, setIsPriorityUpdating] = useState(false)

  const [isRemoving, setIsRemoving] = useState(false)

  const [featureStatus, setFeatureStatus] = useState(props.feature.isDone)

  const [featurePriority, setFeaturePriority] = useState(props.feature.primary)

  const toggleFeatureStatus = async () => {
    try {
      setIsUpdating(true)
      const newStatus = !featureStatus

      await updateFeatureStatus({
        featureId: props.feature.id,
        isDone: newStatus,
        project: props.project,
      })

      setFeatureStatus(newStatus)
    } catch (error) {
      console.error("ステータス更新エラー:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const toggleFeaturePriority = async () => {
    try {
      setIsPriorityUpdating(true)
      const newPriority = featurePriority === "high" ? "low" : "high"
      console.log("優先度を更新します:", props.feature.id, "=>", newPriority)

      await updateFeaturePriority({
        featureId: props.feature.id,
        primary: newPriority,
        project: props.project,
      })
      console.log("優先度の更新が完了しました")

      setFeaturePriority(newPriority)
    } catch (error) {
      console.error("優先度更新エラー:", error)
    } finally {
      setIsPriorityUpdating(false)
    }
  }

  const removeFeature = async () => {
    if (
      !confirm(
        `${props.feature.name} をこのページから削除してもよろしいですか？`,
      )
    ) {
      return
    }

    try {
      setIsRemoving(true)

      await removeFeatureFromPage({
        pageId: props.pageId,
        featureId: props.feature.id,
        project: props.project,
      })
    } catch (error) {
      console.error("機能削除エラー:", error)
    } finally {
      setIsRemoving(false)
    }
  }

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
            onClick={toggleFeatureStatus}
            variant={featureStatus ? "default" : "secondary"}
            disabled={isUpdating || isRemoving}
            className="flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : featureStatus ? (
              <Check className="h-4 w-4" />
            ) : (
              <CircleDashed className="h-4 w-4" />
            )}
          </Button>
          <Button
            size={"sm"}
            onClick={toggleFeaturePriority}
            variant={featurePriority === "high" ? "default" : "secondary"}
            disabled={isPriorityUpdating || isRemoving}
          >
            {isPriorityUpdating
              ? "更新中..."
              : featurePriority === "high"
                ? "優先度:高"
                : "優先度:低"}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size={"sm"}
            onClick={removeFeature}
            variant="destructive"
            disabled={isRemoving}
          >
            {isRemoving ? "削除中..." : "削除"}
          </Button>
          <VscodeButton featureId={props.feature.id} cwd={props.cwd} />
        </div>
      </div>
    </Card>
  )
}
