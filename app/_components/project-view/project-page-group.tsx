"use client"
import { Card } from "@/app/_components/ui/card"
import { FeatureItem } from "./feature-item"
import type { DirectoryFile } from "@/system/types"

type Priority = "high" | "medium" | "low"

type PageGroup = {
  page: DirectoryFile
  features: DirectoryFile[]
}

type Props = {
  group: PageGroup
}

export function ProjectPageGroup(props: Props) {
  const sortedFeatures = props.group.features.sort((a, b) => {
    const priorityOrder: Record<Priority, number> = {
      high: 0,
      medium: 1,
      low: 2,
    }
    const aPriority = (a.frontMatter?.priority as Priority) || "low"
    const bPriority = (b.frontMatter?.priority as Priority) || "low"
    return (priorityOrder[aPriority] || 2) - (priorityOrder[bPriority] || 2)
  })

  return (
    <Card className="w-full rounded-md p-2">
      <div className="flex gap-2">
        {/* 左側: ページ情報 */}
        <div className="w-1/3 space-y-2 border-r pr-4">
          <h2 className="font-semibold text-lg">
            {props.group.page.title || props.group.page.fileName}
          </h2>
          <div className=" text-gray-500 text-xs">
            {props.group.page.fileName}
          </div>
          {props.group.page.description && (
            <p className="text-gray-600 text-sm">
              {props.group.page.description}
            </p>
          )}
        </div>

        {/* 右側: 関連機能一覧 */}
        <div className="flex-1">
          <div className="space-y-3">
            {sortedFeatures.length > 0 ? (
              sortedFeatures.map((feature) => (
                <FeatureItem key={feature.fileName} feature={feature} />
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">
                このページに関連する機能はありません
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
