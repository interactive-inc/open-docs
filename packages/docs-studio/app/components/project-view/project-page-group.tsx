import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DocFile, DocFileMd, DocRelationFile } from "@/lib/types"
import { FeatureItem } from "./feature-item"

function isDocFileMd(file: DocFile): file is DocFileMd {
  return file.type === "markdown"
}

type Priority = "high" | "medium" | "low"

type PageGroup = {
  page: DocFile
  features: DocFile[]
}

type Props = {
  group: PageGroup
  milestoneOptions?: DocRelationFile[]
  onMilestoneUpdate?: (featurePath: string, milestone: string) => void
  onPropertyUpdate?: (
    featurePath: string,
    field: string,
    value: unknown,
  ) => void
  allFeatures?: DocFile[]
  onFeatureAdd?: (pagePath: string, featurePath: string) => void
  onFeatureRemove?: (pagePath: string, featurePath: string) => void
}

export function ProjectPageGroup(props: Props) {
  const sortedFeatures = props.group.features
    .filter(isDocFileMd)
    .sort((a, b) => {
      const priorityOrder: Record<Priority, number> = {
        high: 0,
        medium: 1,
        low: 2,
      }
      const aPriority =
        ((a.content.frontMatter as Record<string, unknown>)
          ?.priority as Priority) || "low"
      const bPriority =
        ((b.content.frontMatter as Record<string, unknown>)
          ?.priority as Priority) || "low"
      return (priorityOrder[aPriority] || 2) - (priorityOrder[bPriority] || 2)
    })

  // このページに関連付けられていない機能を取得
  const linkedFeaturePaths = props.group.features.map((f) => f.path.path)
  const availableFeatures = (props.allFeatures || [])
    .filter(isDocFileMd)
    .filter((feature) => !linkedFeaturePaths.includes(feature.path.path))

  const handleFeatureAdd = (featureValue: string) => {
    if (featureValue && props.onFeatureAdd) {
      props.onFeatureAdd(props.group.page.path.path, featureValue)
    }
  }

  return (
    <Card className="w-full rounded-md p-2">
      <div className="flex flex-col gap-2 lg:flex-row">
        {/* 左側: ページ情報 */}
        <div className="space-y-2 lg:w-1/3">
          <h2 className="font-semibold text-lg">
            {isDocFileMd(props.group.page)
              ? props.group.page.content.title || props.group.page.path.name
              : props.group.page.path.name}
          </h2>
          <div className="text-xs opacity-50">{props.group.page.path.name}</div>
          {isDocFileMd(props.group.page) &&
            props.group.page.content.description && (
              <p className="text-sm opacity-50">
                {props.group.page.content.description}
              </p>
            )}
        </div>
        {/* 右側: 関連機能一覧 */}
        <div className="flex-1">
          <div className="space-y-2">
            {sortedFeatures.length > 0 ? (
              sortedFeatures.map((feature) => (
                <FeatureItem
                  key={feature.path.name}
                  feature={feature}
                  milestoneOptions={props.milestoneOptions}
                  onMilestoneUpdate={props.onMilestoneUpdate}
                  onPropertyUpdate={props.onPropertyUpdate}
                  onFeatureRemove={(featurePath) =>
                    props.onFeatureRemove?.(
                      props.group.page.path.path,
                      featurePath,
                    )
                  }
                />
              ))
            ) : (
              <p className="text-sm italic opacity-50">
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
                    <SelectItem
                      key={feature.path.path}
                      value={feature.path.path || ""}
                    >
                      {feature.content.title || feature.path.name}
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
