"use client"

import { apiClient } from "@/lib/api-client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ProjectPageGroup } from "./project-page-group"
import { UnlinkedFeaturesSection } from "./unlinked-features-section"
import type { DirectoryResponse, DirectoryFile } from "@/system/types"

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

  // ページと関連機能をグループ化
  const pageGroups: PageGroup[] = pages.map((page) => {
    const pageFeatures = (page.frontMatter?.features as string[]) || []
    const relatedFeatures = features.filter((feature) => {
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
    (feature) => !allLinkedFeatures.includes(feature.fileName),
  )

  return (
    <main className="w-full space-y-2 p-4">
      {pageGroups.map((group) => (
        <ProjectPageGroup key={group.page.fileName} group={group} />
      ))}
      <UnlinkedFeaturesSection unlinkedFeatures={unlinkedFeatures} />
    </main>
  )
}
