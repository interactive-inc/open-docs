import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { DocFile, DocFileMd, DocRelationFile } from "@/lib/types"
import { FeatureItem } from "./feature-item"

function isDocFileMd(file: DocFile): file is DocFileMd {
  return file.type === "markdown"
}

type Priority = "high" | "medium" | "low"

type Props = {
  unlinkedFeatures: DocFile[]
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

  const sortedFeatures = props.unlinkedFeatures
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
