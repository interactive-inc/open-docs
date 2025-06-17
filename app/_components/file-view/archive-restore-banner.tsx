"use client"

import { Button } from "@/app/_components/ui/button"
import { Card } from "@/app/_components/ui/card"
import { apiClient } from "@/lib/system/api-client"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
  filePath: string
  onRestore?: () => void
}

export function ArchiveRestoreBanner(props: Props) {
  const router = useRouter()
  const [isRestoring, setIsRestoring] = useState(false)

  const restoreMutation = useMutation({
    async mutationFn() {
      setIsRestoring(true)

      // パスから docs/ プレフィックスを削除
      const normalizedPath = props.filePath.replace(/^docs\//, "")

      // ファイルを復元（アーカイブから移動）
      const response = await apiClient.api.files[":path{.+}"].$put({
        param: {
          path: normalizedPath,
        },
        json: {
          title: null,
          properties: null,
          body: null,
          description: null,
          isArchived: false, // アーカイブを解除
        },
      })

      return response.json()
    },
    onSuccess: async (data) => {
      // 復元後のパスを構築（_ディレクトリを除外）
      const pathSegments = props.filePath.split("/")
      const fileName = pathSegments.pop()
      const restoredPath = pathSegments
        .filter((segment) => segment !== "_")
        .concat(fileName || "")
        .join("/")

      // コールバックを実行
      if (props.onRestore) {
        props.onRestore()
      }

      // 復元後のファイルパスにリダイレクト
      router.push(`/${restoredPath}`)
    },
    onError: (error) => {
      console.error("復元エラー:", error)
      alert("ファイルの復元に失敗しました")
    },
    onSettled: () => {
      setIsRestoring(false)
    },
  })

  return (
    <Card className="p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-x-2">
          <span className="text-muted-foreground text-sm">
            このファイルはアーカイブされています
          </span>
        </div>
        <Button
          size="sm"
          onClick={() => restoreMutation.mutate()}
          disabled={isRestoring || restoreMutation.isPending}
        >
          {isRestoring ? "復元中..." : "復元する"}
        </Button>
      </div>
    </Card>
  )
}
