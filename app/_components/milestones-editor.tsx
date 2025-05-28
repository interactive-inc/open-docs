"use client"

import { FeatureCard } from "@/app/_components/feature-card"
import { Card } from "@/app/_components/ui/card"
import type { zFeature } from "@/lib/models/feature"
import type { zMilestone } from "@/lib/models/milestone"

type Props = {
  milestones: Array<ReturnType<typeof zMilestone.parse>>
  features: Array<ReturnType<typeof zFeature.parse>>
  cwd: string
  project: string
}

export function MilestonesEditor(props: Props) {
  function getFeaturesByMilestone(milestoneId: string) {
    return props.features.filter((feature) => feature.milestone === milestoneId)
  }

  return (
    <div className="grid gap-2">
      {props.milestones.map((milestone) => {
        const milestoneFeatures = getFeaturesByMilestone(milestone.id)
        return (
          <Card key={milestone.id} className="gap-2 overflow-hidden p-2">
            <div className="space-y-1">
              <h2 className="font-semibold text-xl">{milestone.title}</h2>
              <p className="text-muted-foreground text-sm">
                {milestone.description}
              </p>
            </div>
            {milestoneFeatures.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {milestoneFeatures.map((feature) => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    pageId=""
                    cwd={props.cwd}
                    project={props.project}
                  />
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
