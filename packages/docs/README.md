# @interactive-inc/docs

技術仕様書、製品資料など、Markdownで記述された資料をリポジトリで管理する際に、それらを効率的に読み書きするためのAPIを提供します。

## パッケージ構成

- `@interactive-inc/docs-client` - ドキュメント操作のクライアントライブラリ
- `@interactive-inc/docs-server` - サーバー側のドキュメント処理エンジン

```ts
import { DocClient, DocFileSystem, DocPathSystem } from "@interactive-inc/docs-client"

const docClient = new DocClient({
  fileSystem: new DocFileSystem({
    basePath: "/docs", // リポジトリ内のドキュメントルート
    pathSystem: new DocPathSystem(),
  }),
})

const directory = docClient.directory("products/product-1/features")

const fileRef = directory.mdFile("login.md")

const entity = await fileRef.read()

if (entity instanceof Error) throw entity

console.log(entity.content.title)
```

## インストール

```bash
bun i @interactive-inc/docs
# または
npm install @interactive-inc/docs
```

## 設計

このライブラリは、Markdownファイルを構造化されたディレクトリでの動作を想定しています。

以下は製品仕様書を管理する場合の一例です。ディレクトリ構造は自由に設計できます：

```
docs/                   # ドキュメントルート（任意の名前）
├── products/           # 製品ドキュメント（例）
│   ├── product-a/
│   │   ├── index.md    # 製品概要
│   │   ├── features/   # 機能仕様
│   │   │   ├── login.md
│   │   │   └── _/      # アーカイブ（非推奨・削除予定）
│   │   │       └── old-feature.md
│   │   ├── pages/      # 画面仕様
│   │   └── terms/      # 製品固有の用語
│   └── product-b/
├── terms/              # 共通用語集（例）
├── guidelines/         # 開発ガイドライン（例）
└── index.md            # ルートドキュメント
```

## 機能

### メタデータ管理

各Markdownファイルの先頭にYAML形式でメタデータを記述：

```markdown
---
title: ログイン機能
milestone: 2025.01
features:
  - authentication
  - security
priority: high
is-done: false
---

# ログイン機能

説明...

本文...
```

このように操作できます。

```ts
// メタデータの読み取り
const fileRef = docClient.directory("features").mdFile("login.md")

const file = await fileRef.read()

if (file instanceof Error) throw file

// "ログイン機能"
console.log(file.content.title)

// ["authentication", "security"]
console.log(file.content.meta.features)
```

### ファイル間のリレーション

FrontMatterとスキーマを使用して、ドキュメント間の関連を定義できます。

#### スキーマの定義（index.md）

```markdown
---
title: 機能一覧
schema:
  page:
    type: relation
    path: "../pages"
    title: 関連ページ
    required: false
  tags:
    type: multi-relation
    path: "../tags"
    title: タグ
    required: false
---
```

#### リレーションの使用

features/login.md

```markdown
---
title: ログイン機能
page: login-page
tags:
  - authentication
  - security
---
```

#### 使い方

```ts
const featureRef = docClient.directory("features").mdFile("login.md")

const relatedTags = await featureRef.relations("tags")

for (const tagRef of relatedTags) {
  const tagEntity = await tagRef.read()
  if (tagEntity instanceof Error) continue
  console.log(tagEntity.content.title)
}
```

### アーカイブシステム

ファイルを削除する代わりに、`_`ディレクトリに移動することで論理削除を表現できます。

- `features/login.md` → `features/_/login.md` （アーカイブ）
- アーカイブされたファイルも読み取り可能
- 必要に応じて復元可能

```ts
// ファイルをアーカイブする
const fileRef = docClient.directory("specs/v1").mdFile("deprecated-api.md")
await fileRef.archive()
```

## 使い方

### 初期設定

```ts
import { DocClient, DocFileSystem, DocPathSystem } from "@interactive-inc/docs-client"

const docClient = new DocClient({
  fileSystem: new DocFileSystem({
    basePath: "/path/to/your-repo/docs",
    pathSystem: new DocPathSystem(),
  }),
  config: {
    defaultIndexIcon: "📃",
    indexFileName: "index.md",
    archiveDirectoryName: "_",
    defaultDirectoryName: "Directory",
    indexMetaIncludes: [],
    directoryExcludes: [".vitepress"],
  },
})
```

### ファイルの読み書き

```ts
// ファイル読み取り
const fileRef = docClient
  .directory("specifications/api")
  .mdFile("authentication.md")

const entity = await fileRef.read()
if (entity instanceof Error) throw entity

console.log(entity.content.body)
console.log(entity.content.meta)

// ファイル作成・更新
const newEntity = await fileRef.create({
  title: "認証API仕様",
  version: "2.0.0",
  body: `# 認証API仕様

POST /api/v2/auth/login`,
})
```

### FrontMatterの操作

```ts
const entity = await fileRef.read()
if (entity instanceof Error) throw entity

// メタデータ更新
const updatedEntity = entity.withMeta({
  ...entity.content.meta,
  milestone: "2025.02",
})

await fileRef.write(updatedEntity)
```

### アーカイブ操作

```ts
// ファイルをアーカイブ
const fileRef = docClient
  .directory("specifications/api/v1")
  .mdFile("legacy-endpoints.md")
await fileRef.archive()

// アーカイブされたファイルも読み取り可能
const archivedRef = docClient
  .directory("specifications/api/v1/_")
  .mdFile("legacy-endpoints.md")
const archivedEntity = await archivedRef.read()
```

### ファイルツリーの取得

```ts
// ディレクトリツリーの取得
const directoryTree = await docClient.directoryTree("products")
console.log(directoryTree)

// ファイルツリーの取得（ファイルとディレクトリの両方）
const fileTree = await docClient.fileTree("products")
console.log(fileTree)
```

### カスタムスキーマの使用

型安全なメタデータ操作のためにカスタムスキーマを定義できます：

```ts
import type { DocCustomSchema } from "@interactive-inc/docs-client"

// スキーマ定義
type FeatureSchema = DocCustomSchema<{
  milestone: { type: "text"; required: true }
  priority: { type: "select-text"; required: true }
  is_done: { type: "boolean"; required: false }
  tags: { type: "multi-relation"; required: false }
}>

// 型安全なファイル操作
const featureRef = docClient
  .directory("features")
  .mdFile<FeatureSchema>("login.md", {
    milestone: { type: "text", required: true },
    priority: { type: "select-text", required: true },
    is_done: { type: "boolean", required: false },
    tags: { type: "multi-relation", required: false },
  })

const entity = await featureRef.read()
if (entity instanceof Error) throw entity

// 型安全なアクセス
console.log(entity.content.meta.milestone) // string
console.log(entity.content.meta.priority) // string
console.log(entity.content.meta.is_done) // boolean | undefined
```
