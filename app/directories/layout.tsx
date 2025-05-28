import { DirectoryLayoutSidebar } from "@/app/_components/directory-layout-sidebar"
import { getDocsFiles } from "@/app/_utils/get-docs-files"

type Props = {
  children: React.ReactNode
}

export default async function FilesLayout(props: Props) {
  const files = await getDocsFiles()

  return (
    <DirectoryLayoutSidebar files={files}>
      {props.children}
    </DirectoryLayoutSidebar>
  )
}
