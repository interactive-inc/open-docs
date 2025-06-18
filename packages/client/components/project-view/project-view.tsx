import { useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useFilePropertiesMutation } from "@/hooks/use-file-properties-mutation"
import { apiClient } from "@/lib/api-client"
import type { DocDirectory, DocFileMd } from "@/lib/types"
import { ProjectPageGroup } from "./project-page-group"
import { UnlinkedFeaturesSection } from "./unlinked-features-section"

type Props = {
  project: string
}

type PageGroup = {
  page: DocFileMd
  features: DocFileMd[]
}

export function ProjectView(props: Props) {
  const pagesQuery = useSuspenseQuery({
    queryKey: ["apps/client", props.project],
    queryFn: async () => {
      const response = await apiClient.api.directories[":path{.+}"].$get({
        param: { path: `${props.project}/pages` },
      })
      return response.json()
    },
  })

  const featuresQuery = useSuspenseQuery({
    queryKey: ["apps/client",`products/${props.project}/features`],
    queryFn: async () => {
      const response = await apiClient.api.directories[":path{.+}"].$get({
        param: { path: `${props.project}/features` },
      })
      return response.json()
    },
  })

  const pages = pagesQuery.data.files || []

  const features = featuresQuery.data.files || []

  const milestoneRelation = featuresQuery.data.relations?.find(
    (rel) => {return rel.path === `${props.project}/milestones`},
  )

  const milestoneOptions = milestoneRelation?.files || []

  // マイルストーンフィルター状態
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(
    null,
  )

  const updatePropertiesMutation = useFilePropertiesMutation()

  const handleMilestoneUpdate = async (
    featurePath: string,
    milestone: string,
  ) => {
    try {
      await updatePropertiesMutation.mutateAsync({
        path: featurePath,
        field: "milestone",
        value: milestone,
      })
      await featuresQuery.refetch()
    } catch (error) {
      console.error("Failed to update milestone:", error)
    }
  }

  const handlePropertyUpdate = async (
    featurePath: string,
    field: string,
    value: unknown,
  ) => {
    try {
      await updatePropertiesMutation.mutateAsync({
        path: featurePath,
        field: field,
        value: value,
      })
      await featuresQuery.refetch()
    } catch (error) {
      console.error("Failed to update property:", error)
    }
  }

  const handleFeatureAdd = async (pagePath: string, featurePath: string) => {
    // ページのfeaturesフィールドに新しい機能を追加
    const page = pages.find((p) => p.path === pagePath)
    if (!page) return

    const currentFeatures =
      ((page.frontMatter as Record<string, unknown>)?.features as string[]) ||
      []
    const updatedFeatures = [...currentFeatures, featurePath]

    await updatePropertiesMutation.mutateAsync({
      path: pagePath,
      field: "features",
      value: updatedFeatures,
    })

    // 両方のクエリを再取得
    await Promise.all([pagesQuery.refetch(), featuresQuery.refetch()])
  }

  const handleFeatureRemove = async (pagePath: string, featurePath: string) => {
    try {
      const page = pages.find((p) => p.path === pagePath)
      if (!page) return

      const currentFeatures =
        ((page.frontMatter as Record<string, unknown>)?.features as string[]) ||
        []

      // フィーチャーのIDを取得
      const featureId = features.find((f) => f.path === featurePath)?.id

      if (!featureId) return

      const updatedFeatures = currentFeatures.filter((f) => f !== featureId)

      await updatePropertiesMutation.mutateAsync({
        path: pagePath,
        field: "features",
        value: updatedFeatures,
      })

      await Promise.all([pagesQuery.refetch(), featuresQuery.refetch()])
    } catch (error) {
      console.error("Failed to remove feature from page:", error)
    }
  }

  // フィルタリング関数
  const filterFeaturesByMilestone = (features: DocFileMd[]) => {
    if (!selectedMilestone) return features
    return features.filter((feature) => {
      const milestone = (feature.frontMatter as Record<string, unknown>)
        ?.milestone as string
      return milestone === selectedMilestone
    })
  }

  // ページと関連機能をグループ化
  const pageGroups: PageGroup[] = pages.map((page: DocFileMd) => {
    const pageFeatures =
      ((page.frontMatter as Record<string, unknown>)?.features as string[]) ||
      []
    const relatedFeatures = features.filter((feature: DocFileMd) => {
      return pageFeatures.includes(feature.id)
    })

    // フィルタリング適用
    const filteredFeatures = filterFeaturesByMilestone(relatedFeatures)

    return {
      page,
      features: filteredFeatures,
    }
  })

  // 関連付けられていない機能
  const allLinkedFeatures = pageGroups.flatMap((group) =>
    group.features.map((f) => f.id),
  )

  const unlinkedFeatures = filterFeaturesByMilestone(
    features.filter(
      (feature: DocFileMd) => !allLinkedFeatures.includes(feature.id),
    ),
  )

  return (
    <main className="w-full space-y-2 p-2">
      {/* マイルストーンフィルターボタン */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedMilestone === null ? "default" : "secondary"}
          onClick={() => setSelectedMilestone(null)}
          size="sm"
        >
          すべて
        </Button>
        {milestoneOptions.map((milestone) => (
          <Button
            key={milestone.value}
            variant={
              selectedMilestone === milestone.label ? "default" : "secondary"
            }
            onClick={() => setSelectedMilestone(milestone.label)}
            size="sm"
          >
            {milestone.label}
          </Button>
        ))}
      </div>

      {/* ページグループ */}
      <div className="space-y-2">
        {pageGroups.map((group) => (
          <ProjectPageGroup
            key={group.page.fileName}
            group={group}
            milestoneOptions={milestoneOptions}
            onMilestoneUpdate={handleMilestoneUpdate}
            onPropertyUpdate={handlePropertyUpdate}
            allFeatures={features}
            onFeatureAdd={handleFeatureAdd}
            onFeatureRemove={handleFeatureRemove}
          />
        ))}
        <UnlinkedFeaturesSection
          unlinkedFeatures={unlinkedFeatures}
          milestoneOptions={milestoneOptions}
          onMilestoneUpdate={handleMilestoneUpdate}
          onPropertyUpdate={handlePropertyUpdate}
        />
      </div>
    </main>
  )
}
