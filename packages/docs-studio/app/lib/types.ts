import {
  type DocFile,
  DocSchemaBuilder,
  type InferDocFileMd,
} from "@interactive-inc/docs-client"

export * from "@interactive-inc/docs-client"
export { DocSchemaBuilder }

// Schema definitions for pages and features
const pageSchema = new DocSchemaBuilder()
  .text("title", true)
  .multiRelation("features", false)
  .text("layout", false)
  .build()

const featureSchema = new DocSchemaBuilder()
  .text("title", true)
  .multiRelation("features", false)
  .text("milestone", false)
  .boolean("is-done", false)
  .number("priority", false)
  .build()

export type PageCustomSchema = typeof pageSchema

export type FeatureCustomSchema = typeof featureSchema

export type PageFileMd = InferDocFileMd<typeof pageSchema>

export type FeatureFileMd = InferDocFileMd<typeof featureSchema>

export type PageFile = DocFile<PageCustomSchema>

export type FeatureFile = DocFile<FeatureCustomSchema>
