import { FilesLayoutSidebar } from "@/app/_components/files-layout-sidebar"
import { getDocsFiles } from "@/app/_utils/get-docs-files"

type Props = {
  children: React.ReactNode
}

export default async function FilesLayout(props: Props) {
  const files = await getDocsFiles()

  return <FilesLayoutSidebar files={files}>{props.children}</FilesLayoutSidebar>
}
