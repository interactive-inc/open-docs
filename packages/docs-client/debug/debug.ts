import { DocClient } from "@/doc-client"
import { DocFileSystem } from "@/doc-file-system"

const client = new DocClient({
  fileSystem: new DocFileSystem({ basePath: "../../docs" }),
})

const pagesRef = client.directory("docs-studio/pages", {
  features: {
    type: "multi-relation",
    required: true,
  },
})

const mdFileRef = await pagesRef.mdFile("document-editor")

const mdFile = await mdFileRef.read()

if (mdFile instanceof Error) {
  throw mdFile
}

mdFile.withContent(
  mdFile.content.withMetaProperty("features", [
    "edit-document-content",
    "delete-document",
    "foo",
  ]),
)

const relations = await mdFileRef.relations("features", {
  "is-done": {
    required: true,
    type: "boolean",
  },
})

const file = await relations[0].read()

console.log("relations", file)
