"use client"

import { Card } from "@/app/_components/ui/card"
import { apiClient } from "@/lib/system/api-client"
import type { DirectoryFile } from "@/lib/types"
import { useSuspenseQuery } from "@tanstack/react-query"

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

  const milestones: DirectoryFile[] = milestonesData.files || []
  const features: DirectoryFile[] = featuresData.files || []

  function getFeaturesByMilestone(milestoneId: string) {
    return features.filter(
      (feature) =>
        (feature.frontMatter as Record<string, unknown>)?.milestone ===
        milestoneId,
    )
  }

  return (
    <div className="grid gap-2">
      {milestones.map((milestone) => {
        const milestoneFeatures = getFeaturesByMilestone(milestone.fileName)
        return (
          <Card key={milestone.fileName} className="gap-2 overflow-hidden p-2">
            <div className="space-y-1">
              <h2 className="font-semibold text-xl">
                {milestone.title || milestone.fileName}
              </h2>
              <p className="text-muted-foreground text-sm">
                {milestone.description}
              </p>
            </div>
            {milestoneFeatures.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {milestoneFeatures.map((feature) => (
                  <div key={feature.fileName} className="rounded border p-2">
                    <h3 className="font-medium">
                      {feature.title || feature.fileName}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
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
