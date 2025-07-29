import { DocClient } from "@/doc-client"
import { DocFileSystem } from "@/doc-file-system"
import { DocSchemaBuilder } from "@/doc-schema-builder"
import { defineSchema, docCustomSchemaField } from "@/utils"

const client = new DocClient({
  fileSystem: new DocFileSystem({ basePath: "../../docs" }),
})

// Method 1: Using defineSchema (recommended)
const pageSchema = defineSchema({
  features: docCustomSchemaField.multiRelation(true),
})

const pagesRef = client.directory("docs-studio/pages", pageSchema)

const mdFileRef = await pagesRef.mdFile("document-editor")

const mdFile = await mdFileRef.read()

if (mdFile instanceof Error) {
  throw mdFile
}

const _features = mdFile.content.meta().field("features")

mdFile.withContent(
  mdFile.content.withMetaProperty("features", [
    "edit-document-content",
    "delete-document",
    "foo",
  ]),
)

// Method 2: Using field helpers
const featureSchema = defineSchema({
  "is-done": docCustomSchemaField.boolean(true),
})

const relations = await mdFileRef.relations("features", featureSchema)

const file = await relations[0].read()

console.log("relations", file)

// Method 3: Using SchemaBuilder
const fooSchema = new DocSchemaBuilder()
  .multiRelation("feature", true)
  .text("priority", false)
  .build()

const fooRef = client.directory("docs-studio/files", fooSchema)

const aaa = await fooRef.mdFile("a")

const fooFile = await aaa.read()

if (fooFile instanceof Error) {
  throw fooFile
}

fooFile.content.meta().field("feature")
