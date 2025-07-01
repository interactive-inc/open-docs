# @interactive-inc/docs

技術仕様書、製品資料など、Markdownで記述された資料をリポジトリで管理する際に、それらを効率的に読み書きするためのAPIを提供します。

```ts
const docClient = new DocClient({
  fileSystem: new DocFileSystem({
    basePath: "/docs", // リポジトリ内のドキュメントルート
    pathSystem: new DocPathSystem(),
  }),
})

const ref = docClient
  .directory("products/product-1/features")
  .file("login.md")

const entity = await ref.read()

if (entity instanceof Error) throw entity

console.log(entity.content.title)
```

## インストール

```bash
bun add @interactive-inc/docs
# または
npm install @interactive-inc/docs
```

## 設計

このライブラリは、Markdownファイルを構造化されたディレクトリでの動作を想定しています。

### ディレクトリ構造の例

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

```ts
const fileRefs = docClient.directory("products/product-1/features").files()

for (const fileRef of fileRefs) {
  const entity = await fileRef.read()
  if (entity instanceof Error) throw entity
  console.log(entity.content.body)
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

### FrontMatterによるメタデータ管理

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

本文...
```

このように操作できます。

```ts
// FrontMatterの読み取り
const fileRef = docClient.directory("features").mdFile("login.md")

const file = await fileRef.read()

if (file instanceof Error) throw file

// "ログイン機能"
console.log(file.content.frontMatter.title)

// "2025.01"
console.log(file.content.frontMatter.milestone)

// ["authentication", "security"]
console.log(file.content.frontMatter.features)
```

### ファイル間のリレーション

FrontMatterを使用して、ドキュメント間の関連を定義:

```markdown
---
# pages/login-page.md
title: ログイン画面
features:
  - login
  - password-reset
---
```

```ts
// ページが参照している機能を取得
const pageRef = docClient.directory("pages").mdFile("login-page.md")

const page = await pageRef.read()

if (page instanceof Error) throw page

const featureIds = page.content.frontMatter.value.features || []
// ["login", "password-reset"]
```

## 使い方

### 初期設定

```ts
import { DocClient, DocFileSystem, DocPathSystem } from "@interactive-inc/docs"

const docClient = new DocClient({
  fileSystem: new DocFileSystem({
    basePath: "/path/to/your-repo/docs",
    pathSystem: new DocPathSystem(),
  }),
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
console.log(entity.content.frontMatter.value)

// ファイル作成・更新
await fileRef.writeContent(`---
title: 認証API仕様
version: 2.0.0
---

# 認証API仕様

POST /api/v2/auth/login
`)
```

### FrontMatterの操作

```ts
const entity = await fileRef.read()
if (entity instanceof Error) throw entity

// メタデータ更新
const newFrontMatter = new DocFrontMatterMdValue({
  ...entity.content.frontMatter.value,
  milestone: "2025.02",
})

const newContent = entity.content.withFrontMatter(newFrontMatter)
await fileRef.writeContent(newContent.toText())
```

### アーカイブ操作

```ts
// ファイルをアーカイブ
const fileRef = docClient
  .directory("specifications/api/v1")
  .mdFile("legacy-endpoints.md")
await fileRef.archive()
```
