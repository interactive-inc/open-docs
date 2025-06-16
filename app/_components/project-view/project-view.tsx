"use client"

import { Button } from "@/app/_components/ui/button"
import { apiClient } from "@/lib/api-client"
import { useFilePropertiesMutation } from "@/lib/hooks/use-file-properties-mutation"
import type { DirectoryFile, DirectoryResponse } from "@/lib/types"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"
import { ProjectPageGroup } from "./project-page-group"
import { UnlinkedFeaturesSection } from "./unlinked-features-section"

type Props = {
  project: string
}

type PageGroup = {
  page: DirectoryFile
  features: DirectoryFile[]
}

export function ProjectView(props: Props) {
  const pagesQuery = useSuspenseQuery<DirectoryResponse>({
    queryKey: ["directories", `products/${props.project}/pages`],
    queryFn: async () => {
      const response = await apiClient.api.directories[":path{.+}"].$get({
        param: { path: `products/${props.project}/pages` },
      })
      return response.json()
    },
  })

  const featuresQuery = useSuspenseQuery<DirectoryResponse>({
    queryKey: ["directories", `products/${props.project}/features`],
    queryFn: async () => {
      const response = await apiClient.api.directories[":path{.+}"].$get({
        param: { path: `products/${props.project}/features` },
      })
      return response.json()
    },
  })

  const pages = pagesQuery.data.files || []

  const features = featuresQuery.data.files || []

  const milestoneRelation = featuresQuery.data.relations?.find(
    (rel) => rel.path === `products/${props.project}/milestones`,
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
      console.log("Removing feature:", { pagePath, featurePath })
      const page = pages.find((p) => p.path === pagePath)
      if (!page) return

      const currentFeatures =
        ((page.frontMatter as Record<string, unknown>)?.features as string[]) ||
        []
      console.log("Current features:", currentFeatures)

      // パスを正規化する関数
      const normalizePath = (path: string) => {
        return path
          .replace(/^.*\/docs\//, "") // 絶対パスの場合は/docs/より前を除去
          .replace(/^docs\//, "") // 相対パスの場合はdocs/を除去
      }

      // relativePathがある場合はそれを使用、なければ正規化
      const normalizedFeaturePath =
        features.find((f) => f.path === featurePath)?.relativePath ||
        normalizePath(featurePath)
      console.log("Normalized feature path:", normalizedFeaturePath)

      const updatedFeatures = currentFeatures.filter((f) => {
        const normalizedCurrentPath = normalizePath(f)
        return normalizedCurrentPath !== normalizedFeaturePath
      })
      console.log("Updated features:", updatedFeatures)

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
  const filterFeaturesByMilestone = (features: DirectoryFile[]) => {
    if (!selectedMilestone) return features
    return features.filter((feature) => {
      const milestone = (feature.frontMatter as Record<string, unknown>)
        ?.milestone as string
      return milestone === selectedMilestone
    })
  }

  // ページと関連機能をグループ化
  const pageGroups: PageGroup[] = pages.map((page: DirectoryFile) => {
    const pageFeatures =
      ((page.frontMatter as Record<string, unknown>)?.features as string[]) ||
      []
    const relatedFeatures = features.filter((feature: DirectoryFile) => {
      const featureFileName = feature.fileName
      const featureFileNameWithExt = `${featureFileName}.md`

      return pageFeatures.some(
        (pf: string) =>
          pf.endsWith(`/${featureFileNameWithExt}`) ||
          pf.endsWith(`/${featureFileName}`) ||
          pf === featureFileNameWithExt ||
          pf === featureFileName,
      )
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
    group.features.map((f) => f.fileName),
  )

  const unlinkedFeatures = filterFeaturesByMilestone(
    features.filter(
      (feature: DirectoryFile) => !allLinkedFeatures.includes(feature.fileName),
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
