import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type {
  DocCustomSchema,
  DocFile,
  DocFileMd,
  DocRelationFile,
  FeatureCustomSchema,
} from "@/lib/types"
import { FeatureItem } from "./feature-item"

function _isMarkdownFile<T extends DocCustomSchema>(
  file: DocFile<T>,
): file is DocFileMd<T> {
  return file.type === "markdown"
}

type Priority = "high" | "medium" | "low"

type Props = {
  unlinkedFeatures: DocFileMd<FeatureCustomSchema>[]
  milestoneOptions?: DocRelationFile[]
  onMilestoneUpdate?: (featurePath: string, milestone: string) => void
  onPropertyUpdate?: (
    featurePath: string,
    field: string,
    value: unknown,
  ) => void
}

export function UnlinkedFeaturesSection(props: Props) {
  if (props.unlinkedFeatures.length === 0) {
    return null
  }

  const sortedFeatures = props.unlinkedFeatures.sort((a, b) => {
    const priorityOrder: Record<Priority, number> = {
      high: 0,
      medium: 1,
      low: 2,
    }
    const aPriorityValue = a.content.meta.priority ?? 0
    const bPriorityValue = b.content.meta.priority ?? 0
    const aPriority =
      aPriorityValue === 2 ? "high" : aPriorityValue === 1 ? "medium" : "low"
    const bPriority =
      bPriorityValue === 2 ? "high" : bPriorityValue === 1 ? "medium" : "low"
    return (priorityOrder[aPriority] || 2) - (priorityOrder[bPriority] || 2)
  })

  return (
    <Card className="w-full p-2">
      <div className="flex gap-2">
        <div className="w-1/3 border-r pr-4">
          <h2 className="font-semibold text-lg">未関連付け機能</h2>
          <p className="text-gray-600 text-sm">
            ページに関連付けられていない機能
          </p>
          <Badge variant="outline" className="mt-2">
            {props.unlinkedFeatures.length}機能
          </Badge>
        </div>
        <div className="flex-1">
          <div className="space-y-3">
            {sortedFeatures.map((feature) => (
              <FeatureItem
                key={feature.path.name}
                feature={feature}
                milestoneOptions={props.milestoneOptions}
                onMilestoneUpdate={props.onMilestoneUpdate}
                onPropertyUpdate={props.onPropertyUpdate}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
