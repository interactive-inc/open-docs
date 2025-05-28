"use client"

import type { zFeature } from "../../lib/models/feature"
import type { zPage } from "../../lib/models/page"
import { FeatureCard } from "./feature-card"
import { PageCard } from "./page-card"
import { Card } from "./ui/card"

type Props = {
  pages: Array<ReturnType<typeof zPage.parse>>
  features: Array<ReturnType<typeof zFeature.parse>>
  cwd: string
  project: string
}

export function PagesEditor(props: Props) {
  function getFeatures(pageId: string) {
    const page = props.pages.find((p) => p.id === pageId)
    if (!page || !page.features.length) {
      return []
    }
    return page.features
      .map((featureId) => props.features.find((f) => f.id === featureId))
      .filter((n) => n !== undefined)
  }

  return (
    <div className="grid gap-2">
      {props.pages.map((page) => {
        const pageFeatures = getFeatures(page.id)
        return (
          <Card key={page.id} className="overflow-hidden p-2">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {/* 左側：ページ情報 */}
              <PageCard
                page={page}
                featureCount={pageFeatures.length}
                cwd={props.cwd}
                project={props.project}
              />
              {/* 右側：機能リスト */}
              <div className="md:col-span-2">
                {pageFeatures.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {pageFeatures.map((feature) => (
                      <FeatureCard
                        key={feature.id}
                        feature={feature}
                        pageId={page.id}
                        cwd={props.cwd}
                        project={props.project}
                      />
                    ))}
                  </div>
                )}
                {pageFeatures.length === 0 && (
                  <p className="text-sm">
                    {"関連付けられた機能がありません。"}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
