"use client"
import { Card } from "@/app/_components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select"
import type { DirectoryFile, RelationOption } from "@/lib/types"
import { FeatureItem } from "./feature-item"

type Priority = "high" | "medium" | "low"

type PageGroup = {
  page: DirectoryFile
  features: DirectoryFile[]
}

type Props = {
  group: PageGroup
  milestoneOptions?: RelationOption[]
  onMilestoneUpdate?: (featurePath: string, milestone: string) => void
  onPropertyUpdate?: (
    featurePath: string,
    field: string,
    value: unknown,
  ) => void
  allFeatures?: DirectoryFile[]
  onFeatureAdd?: (pagePath: string, featurePath: string) => void
  onFeatureRemove?: (pagePath: string, featurePath: string) => void
}

export function ProjectPageGroup(props: Props) {
  const sortedFeatures = props.group.features.sort((a, b) => {
    const priorityOrder: Record<Priority, number> = {
      high: 0,
      medium: 1,
      low: 2,
    }
    const aPriority =
      ((a.frontMatter as Record<string, unknown>)?.priority as Priority) ||
      "low"
    const bPriority =
      ((b.frontMatter as Record<string, unknown>)?.priority as Priority) ||
      "low"
    return (priorityOrder[aPriority] || 2) - (priorityOrder[bPriority] || 2)
  })

  // このページに関連付けられていない機能を取得
  const linkedFeaturePaths = props.group.features.map((f) => f.path)
  const availableFeatures = (props.allFeatures || []).filter(
    (feature) => !linkedFeaturePaths.includes(feature.path),
  )

  const handleFeatureAdd = (featureValue: string) => {
    if (featureValue && props.onFeatureAdd) {
      props.onFeatureAdd(props.group.page.path || "", featureValue)
    }
  }

  return (
    <Card className="w-full rounded-md p-2">
      <div className="flex gap-2">
        {/* 左側: ページ情報 */}
        <div className="w-1/3 space-y-2 border-r pr-4">
          <h2 className="font-semibold text-lg">
            {props.group.page.title || props.group.page.fileName}
          </h2>
          <div className=" text-gray-500 text-xs">
            {props.group.page.fileName}
          </div>
          {props.group.page.description && (
            <p className="text-gray-600 text-sm">
              {props.group.page.description}
            </p>
          )}
        </div>

        {/* 右側: 関連機能一覧 */}
        <div className="flex-1">
          <div className="space-y-3">
            {sortedFeatures.length > 0 ? (
              sortedFeatures.map((feature) => (
                <FeatureItem
                  key={feature.fileName}
                  feature={feature}
                  milestoneOptions={props.milestoneOptions}
                  onMilestoneUpdate={props.onMilestoneUpdate}
                  onPropertyUpdate={props.onPropertyUpdate}
                  onFeatureRemove={(featurePath) =>
                    props.onFeatureRemove?.(
                      props.group.page.path || "",
                      featurePath,
                    )
                  }
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">
                このページに関連する機能はありません
              </p>
            )}

            {/* 機能追加用Select */}
            {availableFeatures.length > 0 && (
              <Select value="" onValueChange={handleFeatureAdd}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="機能を追加..." />
                </SelectTrigger>
                <SelectContent>
                  {availableFeatures.map((feature) => (
                    <SelectItem key={feature.path} value={feature.path || ""}>
                      {feature.title || feature.fileName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
