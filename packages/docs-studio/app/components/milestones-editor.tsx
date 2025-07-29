import { useSuspenseQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { apiClient } from "@/lib/api-client"
import type {
  DocCustomSchema,
  DocFile,
  DocFileMd,
  FeatureFile,
  FeatureFileMd,
} from "@/lib/types"

type Props = {
  project: string
}

export function MilestonesEditor(props: Props) {
  const { data: milestonesData } = useSuspenseQuery({
    queryKey: ["directories", `products/${props.project}/milestones`],
    queryFn: async () => {
      const response = await apiClient.api.directories[":path{.+}"].$get({
        param: { path: `products/${props.project}/milestones` },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch milestones")
      }
      return response.json()
    },
  })

  const { data: featuresData } = useSuspenseQuery({
    queryKey: ["directories", `products/${props.project}/features`],
    queryFn: async () => {
      const response = await apiClient.api.directories[":path{.+}"].$get({
        param: { path: `products/${props.project}/features` },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch features")
      }
      return response.json()
    },
  })

  function isDocFileMd(file: DocFile): file is DocFileMd<DocCustomSchema> {
    return file.type === "markdown"
  }

  function isFeatureFileMd(file: DocFile): file is FeatureFileMd {
    return file.type === "markdown"
  }

  function hasMarkdownContent(file: { content: unknown }): file is {
    content: {
      title: string
      description: string
      meta: Record<string, unknown>
    }
  } {
    return (
      typeof file.content === "object" &&
      file.content !== null &&
      "meta" in file.content
    )
  }

  const milestones = (milestonesData.files || []).filter((file) =>
    isDocFileMd(file as DocFile),
  )
  const features = (featuresData.files || [])
    .map((file) => file as FeatureFile)
    .filter(isFeatureFileMd)

  function getFeaturesByMilestone(milestoneId: string) {
    return features.filter((feature) => {
      const milestone = feature.content.meta.milestone ?? ""
      return milestone === milestoneId
    })
  }

  return (
    <div className="grid gap-2">
      {milestones.map((milestone) => {
        const milestoneFeatures = getFeaturesByMilestone(milestone.path.name)
        return (
          <Card key={milestone.path.name} className="gap-2 overflow-hidden p-2">
            <div className="space-y-1">
              <h2 className="font-semibold text-xl">
                {hasMarkdownContent(milestone)
                  ? milestone.content.title || milestone.path.name
                  : milestone.path.name}
              </h2>
              <p className="text-muted-foreground text-sm">
                {hasMarkdownContent(milestone)
                  ? milestone.content.description
                  : ""}
              </p>
            </div>
            {milestoneFeatures.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {milestoneFeatures.map((feature) => (
                  <div key={feature.path.name} className="rounded border p-2">
                    <h3 className="font-medium">
                      {(feature.content &&
                      typeof feature.content === "object" &&
                      "title" in feature.content
                        ? feature.content.title
                        : null) || feature.path.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {(feature.content &&
                      typeof feature.content === "object" &&
                      "description" in feature.content
                        ? feature.content.description
                        : null) || ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-muted-foreground">
                このマイルストーンに関連する機能はありません
              </p>
            )}
          </Card>
        )
      })}
    </div>
  )
}
