import { DocClient, DocFileSystem, DocPathSystem } from "../../docs/lib"

const pathSystem = new DocPathSystem()
const client = new DocClient({
  indexFileName: "index.md",
  archiveDirectoryName: "_",
  fileSystem: new DocFileSystem({
    basePath: "../../docs",
    pathSystem,
  }),
})

const fileRef = client.mdFile("products/client/features/create-document.md")

const _file = await fileRef.readContent()

const directoryRef = client.directory("products/client/features")

const filesRefs = directoryRef.mdFilesGenerator()

for await (const _fileRef of filesRefs) {
  _fileRef
  // console.log(await fileRef.read())
}

const indexFileRef = directoryRef.indexFile()

const relations = await indexFileRef.readRelations()

if (relations instanceof Error) {
  console.error(relations)
  process.exit(1)
}

console.log(relations[0]?.files)
