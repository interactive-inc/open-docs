import path from "node:path"
import { DocClient, DocFileSystem, DocPathSystem } from "@interactive-inc/docs"
import { cwd } from "./cwd"

export function docClient(docsPath = "docs"): DocClient {
  const pathSystem = new DocPathSystem()

  const fileSystem = new DocFileSystem({
    basePath: path.join(cwd(), docsPath),
    pathSystem,
  })

  return new DocClient({
    fileSystem,
  })
}
