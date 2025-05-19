import path from "node:path"
import { createFeatureRecords } from "./create-feature-records"
import { createMilestoneRecords } from "./create-milestone-records"
import { createPageRecords } from "./create-page-records"

type Props = {
  directory: string
}

export async function getDocsData(props: Props) {
  const baseDirectory = path.join(process.cwd(), "docs/products")
  const directory = props.directory

  const pages = await createPageRecords({
    directory: path.join(baseDirectory, `${directory}/pages`),
  })

  const features = await createFeatureRecords({
    directory: path.join(baseDirectory, `${directory}/features`),
  })

  const milestones = await createMilestoneRecords({
    directory: path.join(baseDirectory, `${directory}/milestones`),
  })

  return { pages, features, milestones }
}
