import { DocClient } from "../packages/docs-client/lib/doc-client"
import { DocFileSystem } from "../packages/docs-client/lib/doc-file-system"
import { DocPathSystem } from "../packages/docs-client/lib/doc-path-system"

async function testSchemaFallback() {
  console.log("=== スキーマフィールドのフォールバック確認 ===\n")

  // DocClientの初期化
  const pathSystem = new DocPathSystem()
  const fileSystem = new DocFileSystem({
    basePath: "/Users/n/Documents/open-docs/docs",
    pathSystem,
  })
  const client = new DocClient({ fileSystem })

  try {
    // tagsのindex.mdを読み込む
    const tagsIndex = client.mdFile("debug/tags/index.md")
    const tagsIndexContent = await tagsIndex.read()

    if (tagsIndexContent instanceof Error) {
      console.error("index.mdの読み込みエラー:", tagsIndexContent.message)
      return
    }

    console.log("tags/index.mdのスキーマ:")

    // index.mdの場合、frontMatterが特殊
    const indexFile = await client.indexFile("debug/tags").read()
    if (indexFile instanceof Error) {
      console.error("index.mdの読み込みエラー:", indexFile.message)
      return
    }

    const schema = indexFile.content.frontMatter.schema
    console.log("スキーマフィールド数:", schema.fieldNames.length)

    // 各フィールドを確認
    for (const fieldName of schema.fieldNames) {
      const field = schema.field(fieldName)
      if (field) {
        console.log(`\nフィールド: ${fieldName}`)
        console.log(`  type: ${field.type}`)
        console.log(`  required: ${field.required}`)
        console.log(`  title: ${field.title}`)
        console.log(`  description: ${field.description}`)
        console.log(`  default: ${field.default}`)
      }
    }
  } catch (error) {
    console.error("エラー:", error)
  }
}

// スクリプトを実行
testSchemaFallback()
