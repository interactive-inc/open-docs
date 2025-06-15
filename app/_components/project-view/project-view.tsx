"use client"

import { apiClient } from "@/lib/api-client"
import { useFilePropertiesMutation } from "@/lib/hooks/use-file-properties-mutation"
import type { DirectoryFile, DirectoryResponse } from "@/lib/types"
import { useSuspenseQuery } from "@tanstack/react-query"
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

  // featuresディレクトリのリレーション情報からマイルストーンを取得
  console.log("Available relations:", featuresQuery.data.relations)
  const milestoneRelation = featuresQuery.data.relations?.find(
    (rel) => rel.path === `products/${props.project}/milestones`,
  )
  console.log("Milestone relation found:", milestoneRelation)
  const milestoneOptions = milestoneRelation?.files || []
  console.log("Milestone options:", milestoneOptions)

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
    try {
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
    } catch (error) {
      console.error("Failed to add feature to page:", error)
    }
  }

  const handleFeatureRemove = async (pagePath: string, featurePath: string) => {
    try {
      const page = pages.find((p) => p.path === pagePath)
      if (!page) return

      const currentFeatures =
        ((page.frontMatter as Record<string, unknown>)?.features as string[]) ||
        []
      const updatedFeatures = currentFeatures.filter((f) => f !== featurePath)

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

    return {
      page,
      features: relatedFeatures,
    }
  })

  // 関連付けられていない機能
  const allLinkedFeatures = pageGroups.flatMap((group) =>
    group.features.map((f) => f.fileName),
  )

  const unlinkedFeatures = features.filter(
    (feature: DirectoryFile) => !allLinkedFeatures.includes(feature.fileName),
  )

  return (
    <main className="w-full space-y-2 p-4">
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
    </main>
  )
}
