import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { apiClient } from "@/lib/api-client"
import { normalizePath } from "@/utils"

type Props = {
  filePath: string
  onRestore?: () => void
}

export function ArchiveRestoreBanner(props: Props) {
  const navigate = useNavigate()

  const [isRestoring, setIsRestoring] = useState(false)

  const restoreMutation = useMutation({
    async mutationFn() {
      setIsRestoring(true)

      // パスから docs/ プレフィックスを削除
      const normalizedPath = normalizePath(props.filePath)

      // ファイルを復元（アーカイブから移動）
      const response = await apiClient.api.files[":path{.+}"].$put({
        param: {
          path: normalizedPath,
        },
        json: {
          title: null,
          properties: null,
          content: null,
          description: null,
          isArchived: false, // アーカイブを解除
        },
      })

      return response.json()
    },
    onSuccess: async (_data) => {
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
      navigate({ to: `/${restoredPath}` })
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
