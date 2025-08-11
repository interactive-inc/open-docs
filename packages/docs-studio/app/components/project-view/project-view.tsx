import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import type {
  DocCustomSchema,
  DocFile,
  DocFileMd,
  DocRelationFile,
  FeatureCustomSchema,
  FeatureFile,
  PageCustomSchema,
  PageFile,
} from "@/lib/types"
import { normalizePath } from "@/utils"
import { ProjectPageGroup } from "./project-page-group"
import { UnlinkedFeaturesSection } from "./unlinked-features-section"

type Props = {
  project: string
}

type PageGroup = {
  page: DocFileMd<PageCustomSchema>
  features: DocFileMd<FeatureCustomSchema>[]
}

const directoryEndpoint = apiClient.api.directories[":path{.+}"]

export function ProjectView(props: Props) {
  const pagesQuery = useSuspenseQuery({
    queryKey: [
      directoryEndpoint.$url({ param: { path: `${props.project}/pages` } }),
    ],
    queryFn: async () => {
      const response = await directoryEndpoint.$get({
        param: { path: `${props.project}/pages` },
      })
      return response.json()
    },
  })

  const featuresQuery = useSuspenseQuery({
    queryKey: [
      directoryEndpoint.$url({ param: { path: `${props.project}/features` } }),
    ],
    queryFn: async () => {
      const response = await directoryEndpoint.$get({
        param: { path: `${props.project}/features` },
      })
      return response.json()
    },
  })

  const pages = (pagesQuery.data.files || []) as PageFile[]

  const features = (featuresQuery.data.files || []) as FeatureFile[]

  const milestoneRelation = featuresQuery.data.relations?.find((rel) => {
    return rel.path === `${props.project}/milestones`
  })

  const milestoneOptions = milestoneRelation?.files || []

  const [currentMilestone, setCurrentMilestone] = useState<string | null>(null)

  // フロントマター更新のためのmutation
  const fileEndpoint = apiClient.api.files[":path{.+}"]

  const updatePropertiesMutation = useMutation({
    async mutationFn(params: { path: string; field: string; value: unknown }) {
      const path = normalizePath(params.path)

      const properties = { [params.field]: params.value }

      const response = await fileEndpoint.$put({
        param: { path },
        json: {
          properties,
          content: null,
          title: null,
          description: null,
          isArchived: null,
        },
      })

      return response.json()
    },
  })

  const handleMilestoneUpdate = async (
    featurePath: string,
    milestone: string,
  ) => {
    await updatePropertiesMutation.mutateAsync({
      path: featurePath,
      field: "milestone",
      value: milestone,
    })
    await featuresQuery.refetch()
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
    const page = pages.find((p) => p.path.path === pagePath)
    if (!page || !isMarkdownFile(page)) return

    const currentFeatures = page.content.meta.features || []
    const updatedFeatures = Array.isArray(currentFeatures)
      ? [...currentFeatures, featurePath]
      : [featurePath]

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
      const page = pages.find((p) => p.path.path === pagePath)
      if (!page || !isMarkdownFile(page)) return

      const currentFeatures = page.content.meta.features || []

      // フィーチャーを削除
      const updatedFeatures = Array.isArray(currentFeatures)
        ? currentFeatures.filter((f) => f !== featurePath)
        : []

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
  const filterFeaturesByMilestone = (
    features: FeatureFile[],
  ): DocFileMd<FeatureCustomSchema>[] => {
    if (!currentMilestone) {
      return features.filter(
        (feature): feature is DocFileMd<FeatureCustomSchema> =>
          isMarkdownFile(feature),
      )
    }
    return features
      .filter((feature): feature is DocFileMd<FeatureCustomSchema> =>
        isMarkdownFile(feature),
      )
      .filter((feature) => {
        const milestone = feature.content.meta.milestone ?? ""
        return milestone === currentMilestone
      })
  }

  function isMarkdownFile<T extends DocCustomSchema>(
    file: DocFile<T>,
  ): file is DocFileMd<T> {
    return file.type === "markdown"
  }

  function _hasFeaturesMeta<T extends DocFile<DocCustomSchema>>(
    file: T,
  ): file is Extract<T, { type: "markdown" }> & {
    content: { meta: { features?: unknown } }
  } {
    return (
      file.type === "markdown" &&
      "meta" in file.content &&
      "features" in file.content.meta
    )
  }

  // ページと関連機能をグループ化
  const pageGroups: PageGroup[] = pages
    .filter((page): page is DocFileMd<PageCustomSchema> => isMarkdownFile(page))
    .map((page) => {
      const pageFeatures = page.content.meta.features || []
      const relatedFeatures = features.filter((feature) => {
        if (!Array.isArray(pageFeatures)) return false
        return (pageFeatures as string[]).includes(feature.path.path)
      })

      // フィルタリング適用
      const filteredFeatures = filterFeaturesByMilestone(relatedFeatures)

      return {
        page: page,
        features: filteredFeatures,
      }
    })

  // 関連付けられていない機能
  const allLinkedFeatures = pageGroups.flatMap((group) =>
    group.features.map((f) => f.path.path),
  )

  const unlinkedFeatures = filterFeaturesByMilestone(
    features.filter(
      (feature) => !allLinkedFeatures.includes(feature.path.path),
    ),
  )

  return (
    <main className="w-full space-y-2 p-2">
      {/* マイルストーンフィルターボタン */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={currentMilestone === null ? "default" : "secondary"}
          onClick={() => setCurrentMilestone(null)}
          size="sm"
        >
          すべて
        </Button>
        {milestoneOptions.map((milestone: DocRelationFile) => (
          <Button
            key={milestone.name}
            variant={
              currentMilestone === milestone.name ? "default" : "secondary"
            }
            onClick={() => setCurrentMilestone(milestone.name)}
            size="sm"
          >
            {milestone.name}
          </Button>
        ))}
      </div>

      {/* ページグループ */}
      <div className="space-y-2">
        {pageGroups.map((group) => (
          <ProjectPageGroup
            key={group.page.path.name}
            group={group}
            milestoneOptions={milestoneOptions}
            onMilestoneUpdate={handleMilestoneUpdate}
            onPropertyUpdate={handlePropertyUpdate}
            allFeatures={features.filter(
              (f): f is DocFileMd<FeatureCustomSchema> => isMarkdownFile(f),
            )}
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
