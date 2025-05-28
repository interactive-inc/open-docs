import { MilestonesEditor } from "@/app/_components/milestones-editor"
import { env } from "@/lib/env"
import { getDocsData } from "@/lib/get-docs-data"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{
    project: string
  }>
}

export default async function MilestonesPage(props: Props) {
  const projects = env().NEXT_PUBLIC_PROJECTS.split(",")

  const { project } = await props.params

  // プロジェクトが有効かどうかをチェック
  if (!projects.includes(project)) {
    notFound()
  }

  const { features, milestones } = await getDocsData({
    directory: project,
  })

  return (
    <MilestonesEditor
      milestones={milestones}
      features={features}
      cwd={process.cwd()}
      project={project}
    />
  )
}
