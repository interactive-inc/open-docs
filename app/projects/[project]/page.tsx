import { PagesEditor } from "@/app/components/pages-editor"
import { env } from "@/lib/env"
import { getDocsData } from "@/lib/get-docs-data"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type Props = {
  params: {
    project: string
  }
}

export default async function Page(props: Props) {
  const projects = env().NEXT_PUBLIC_PROJECTS.split(",")

  const params = await props.params

  // プロジェクトが有効かどうかをチェック
  if (!projects.includes(params.project)) {
    notFound()
  }

  const { pages, features } = await getDocsData({
    directory: params.project,
  })

  return (
    <PagesEditor
      pages={pages}
      features={features}
      cwd={process.cwd()}
      project={params.project}
    />
  )
}
