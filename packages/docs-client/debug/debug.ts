import { DocClient } from "../lib/doc-client"
import { DocFileSystem } from "../lib/doc-file-system"
import { DocPathSystem } from "../lib/doc-path-system"

// DocClientの初期化
const basePath = "/Users/n/Documents/open-docs/docs" // docs ディレクトリをベースパスに
const pathSystem = new DocPathSystem()
const fileSystem = new DocFileSystem({
  basePath,
  pathSystem,
})
const docClient = new DocClient({
  fileSystem,
  pathSystem,
})

async function demonstrateRelations() {
  console.log("=== DocClient リレーション機能のデモ ===\n")

  // 1. ファイルを取得 (.mdファイルなのでmdFile()を使用)
  const pageFile = docClient.mdFile("products/doc-browser/pages/home.md")
  console.log("1. ファイルを取得:")
  console.log(`   パス: ${pageFile.path}`)

  // 2. ファイルの内容を読み込む
  const pageEntity = await pageFile.read()
  if (pageEntity instanceof Error) {
    console.error("   エラー:", pageEntity.message)
    return
  }
  console.log(`   タイトル: ${pageEntity.content.title}`)
  console.log(`   FrontMatter:`, pageEntity.content.frontMatter.value)

  // 3. 単一のリレーションを取得（author）
  console.log("\n2. 単一のリレーションを取得 (author):")
  const authorRelation = await pageFile.relation("author")
  if (authorRelation && !(authorRelation instanceof Error)) {
    console.log(`   リレーション先のパス: ${authorRelation.path}`)

    // リレーション先のファイルを読み込む
    const authorEntity = await authorRelation.read()
    if (!(authorEntity instanceof Error)) {
      console.log(`   著者名: ${authorEntity.content.title}`)
      console.log(
        `   内容の一部: ${authorEntity.content.body.substring(0, 50)}...`,
      )
    } else {
      console.log(`   読み込みエラー: ${authorEntity.message}`)
    }
  } else if (authorRelation instanceof Error) {
    console.log(`   エラー: ${authorRelation.message}`)
  } else {
    console.log("   リレーションが見つかりません")
  }

  // 4. 複数のリレーションを取得（features）
  console.log("\n3. 複数のリレーションを取得 (features):")
  const featureRelations = await pageFile.relations("features")
  console.log(`   機能数: ${featureRelations.length}`)

  for (const featureRef of featureRelations) {
    console.log(`   - パス: ${featureRef.path}`)
    const featureEntity = await featureRef.read()
    if (!(featureEntity instanceof Error)) {
      console.log(`     タイトル: ${featureEntity.content.title}`)
    }
  }

  // 4.5. 別の単一リレーションを取得（category）
  console.log("\n4. 別の単一リレーションを取得 (category):")
  const categoryRelation = await pageFile.relation("category")
  if (categoryRelation && !(categoryRelation instanceof Error)) {
    console.log(`   リレーション先のパス: ${categoryRelation.path}`)
    const categoryEntity = await categoryRelation.read()
    if (!(categoryEntity instanceof Error)) {
      console.log(`   カテゴリー名: ${categoryEntity.content.title}`)
    }
  }

  // 5. ディレクトリのindex.mdからスキーマを確認
  console.log("\n5. ディレクトリのindex.mdからスキーマを確認:")
  const indexFile = await pageFile.getDirectoryIndex()
  if (indexFile) {
    const schema = indexFile.content.frontMatter.value.schema
    console.log("   スキーマ定義:")
    if (schema && typeof schema === "object") {
      for (const [key, field] of Object.entries(schema)) {
        if (typeof field === "object" && field !== null && "type" in field) {
          console.log(`   - ${key}: ${field.type}`)
          if ("path" in field) {
            console.log(`     パス: ${field.path}`)
          }
        }
      }
    }
  }

  // 6. ディレクトリ内のファイル一覧を取得
  console.log("\n6. ディレクトリ内のファイル一覧:")
  const pagesDir = docClient.directory("products/doc-browser/pages")
  const files = await pagesDir.files()
  for (const file of files) {
    console.log(`   - ${file.path}`)
  }
}

// 実行
demonstrateRelations().catch(console.error)
