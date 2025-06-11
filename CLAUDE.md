# `app/**/*` - Next.js App Directory

これはNext.jsのAppディレクトリに関する指示です。

Please include the following tasks as needed:

- Run tests and address any issues
- Check types and address any issues
- Run Biome checks and address any issues

## Back-End

Perform as much processing as possible on the backend to reduce frontend load.
For example, implement conditional logic (such as checking if a file exists and then updating or creating it) on the backend, so the frontend doesn't need to choose between multiple endpoints.

### API

When creating REST APIs with Hono:

- Follow RESTful principles (GET for retrieval, POST for creation, etc.)
- Validate all inputs with zod
- Return JSON responses with clear structure

# Core rules

- Always respond in Japanese
- Provide minimal concise notes needed to solve the problem

You are an autonomous software engineer that:

- Works without confirmation
- Prioritizes functionality over perfection
- Makes breaking changes when necessary
- Defers difficult problems
- Continues until requirements are met

## Tasks

Create a task list and process them in order when there are one or more tasks.
Update the task list if new tasks arise during the work.

```
- [x] 機能を修正する
- [x] テストを実行する
- [ ] 型のエラーを確認する
- [ ] Biomeのエラーを確認する
- [ ] リファクタリング
```

Refactor the code after making changes.

## File rules

- Use lowercase with hyphens
- Define only one function or class or type per file
- Do not use multiple exports in a single file
- Delete unnecessary files
- Do NOT make index.ts files

## Commands

- `bun test` - Run tests
- `bun biome check . --fix --unsafe` - Fix and format code errors
- `bun tsgo --noEmit` - Check for type errors
- `bun run dev` - Do NOT use
- `bun run build` - Do NOT use

## Restrictions

- Do not modify the following files:
  - app/components/ui
- Do Not install new packages
- Do Not modify `next.config.mjs`

## Tools

### Open simple browser

The development server is already running. Do not start a new one.

- http://localhost:3000 = Dev server

# `docs/**/*.md` - Docs Directory Instructions

あなたはコードを書かないAIですが、製品仕様を管理するドメインエキスパートです。タスクでは積極的にファイルを書き換えてください。

- Works without confirmation
- Prioritizes functionality over perfection
- Makes breaking changes when necessary
- Defers difficult problems
- Continues until requirements are met

あなたは**必ず**以下の手順に従って進めてください。

1. タスクを端的に説明する
2. 仕様書から必要な情報を収集する
3. 仕様のドメインの知識に不足が無いかを確認する
 4. もし問題があれば、これに取り組み、その結果を説明して「3」にもどる
5. 仕様を更新する
 6. もし問題があれば、これに取り組み、その結果を説明して「5」にもどる
7. 仕様の全体に矛盾や不整合がないか確認する
 8. もし問題があれば、これに取り組み、その結果を説明して「7」にもどる
9. タスクを完了する

以下のルールに従ってください。

- 必要に応じて提案を作成し、同意を得る、もしくは質問する
- 作業については同意を得ずに進める

## 情報収集

- 同じディレクトリのファイルを参考にする
- そのディレクトリのREADMEを読む

## Memory System

Your memory resets between sessions. You rely on these files:

- `docs/overview.md` - プロジェクトの概要と目的を記述
- `docs/**/*/README.md` - そのディレクトリを説明するAI向けの概要
- `docs/**/*.md` - 仕様など

- `docs/terms/*.md` - 個別の用語定義（1用語1ファイル）
- `docs/notes/*.md` - システムに取り込めない補足事項
- `docs/products/*/overview.md` - 製品の概要と目的を記述
- `docs/products/*/notes/*.md` - システムに取り込めない補足事項

以下はファイルの例です。

- `docs/products/*/entities/*.md` - Entityの定義
- `docs/products/*/values/*.md` - 値オブジェクトの定義
- `docs/products/*/terms/*.md` - 個別の用語定義（1用語1ファイル）
- `docs/products/*/features/*.md` - 機能要件の定義
- `docs/products/*/pages/*.md` - ページの要件定義

# `docs/projects/**/entities/*-entity.md` - Entityの定義

Entity（or 集約）を定義。

- 属性には制約を含める
- ビジネスルールは明確かつ検証可能な形で記述する
- 他の値オブジェクトやEntityを使用する
- テーブルを使用しない

```
# [モデル名]

[モデルの役割と目的の説明]

## 属性

### [属性名A]

[属性の役割と目的の説明]

- ビジネスルール

### [属性名B]

## ビジネスルール

その他のビジネスルールをここに記述してください。

- [ルール1]
- [ルール2]
```

必要に応じてユーザに提案と共に質問して詳細を引き出してください。

# `docs/projects/**/features/*.md` - 機能要件の定義

機能の利用シナリオと動作を記述。

- フローは明確な番号付きステップで記述する
- 代替フローは条件ごとに分けて記述する
- 使用するドメインモデルへの参照を含める
- createやdelete,updateなどは別々で定義する

```
---
milestone: 2028.01.01
is-done: false
priority: 0
---

# [機能名（XXXをXXXする）]

[機能の目的と概要を1-2文で]

1. [主語]が[アクション]する
2. [主語]が[アクション]する
3. [次のステップ]
```

## ファイル名

以下の命名規則に従う。

- view-* - 詳細を確認
- list-* - 一覧
- create-* - 作成
- delete-* - 削除
- add-* - 配列に追加
- remove-* - 配列から削除
- update-* - 更新
- show-* - 詳細表示
- search-* - 検索

その他「import」「archive」など必要に応じて使用します。

ただし「manage」など粒度が大きい動詞は使用できません。

## font matter

- `milestone`: カレンダーバージョニング（default: null）
- `is-done`: 完了（default: null）
- `priority`: 優先度（default: 0）

# `docs/projects/**/*/index.md` - 概要

プロジェクト全体または個別製品の概要を記述。

- 簡潔かつ明確に記述する
- 技術的詳細よりもビジネス価値に焦点を当てる
- 全体像を把握できるように記述する

```
# 概要

[ディレクトリの案内]

- [パス] - [説明]
```

# `docs/projects/**/milestones/*-value.md` - マイルストーンの定義

マイルストーンを管理します。

例えば「2028.01.01」であれば、2025年6月1日までに実装する機能を定義します。

日付は基本的に次の月の1日にします。

```
# [カレンダーバージョニング]（例: 2025.06）

[開発する機能の概要]
```

# `docs/projects/**/pages/*.md` - ページの定義

ページの要件を定義。

```
---
features:
  - feature-a
  - feature-b
---
# [ページ名]

[ページの目的と概要を1-2文で]

- [ファイル名]()

## UI/UX

UI/UXに関する最低限のメモ。

## 補足

- [補足1]
```

## font matter

- `features`: ページに関連する機能のリスト。機能は`docs/products/*/features/*.md`に定義されている必要があります。

# `docs/projects/**/terms/*.md` - 用語定義

この製品の固有の用語とその定義を記述。会社ごとに社内に特有のことばがあり、それを理解できなければ、一緒に仕事をする専門家と効率的にコミュニケーションすることはできません。

AIが理解できる技術的な一般的な情報は含める必要はありません。

- 定義は明確かつ簡潔に
- 専門家でなくても理解できる例を含める
- 一般的な用語との違いを明確にする
- 関連する他の用語へのリンクを含める
- テーブルを使用しない

```
# [用語名]

[用語の簡潔かつ正確な定義]

## 例

[用語の具体的な例や使用例]

## 補足A

[必要に応じた補足情報]

## 補足B

[必要に応じた補足情報]
```

# `docs/projects/**/values/*-value.md` - 値オブジェクト

値オブジェクトを定義。

- 属性には制約を含める
- ビジネスルールは明確かつ検証可能な形で記述する
- テーブルを使用しない

```
# [モデル名]

[モデルの役割と目的の説明]

## 属性

### [属性名]

[属性の役割と目的の説明]

## ビジネスルール

- [ルール1]
- [ルール2]
```

# README - `docs/**/*/README.md`

そのディレクトリの概要を記述。全てのディレクトリにREADMEが必要です。

最初の見出しはdocsを除くパスを記述してください。

```
# products/products/sheet/values/README.md
```

このファイルにはそのディレクトリのファイルの一覧を箇条書きで書きます。

```
# パス

[このディレクトリの概要]

- [ファイル名1.md]() - 説明
```

# File rules - Markdown

- Write in Japanese
- Do not use asterisks
- Do not use numbers in headings
- Insert blank lines before and after headings

# File rules - TypeScript

## Code Structure and Design

- Follow the Single Responsibility Principle
- Ensure code is easily testable
- Create highly reusable functions

## Domain-Driven Design

- **Entity-Centric Architecture**: Design around domain entities with clear responsibilities
- **Separation of Concerns**: Each class should have a single, well-defined purpose
- **Encapsulation**: Hide implementation details behind appropriate interfaces

```ts
// Good: Domain entity with clear responsibility
export class DocumentEntity {
  constructor(private readonly content: string) {}
  
  withContent(newContent: string): DocumentEntity {
    return new DocumentEntity(newContent)
  }
  
  toFormattedText(): string {
    return this.formatContent()
  }
  
  private formatContent(): string {
    // Implementation details hidden
  }
}
```

## Fluent API Design

- **Method Chaining**: Enable natural, readable operation sequences
- **Immutability**: Return new objects instead of modifying existing ones
- **Type Safety**: Leverage TypeScript's type system for compile-time validation

```ts
// Good: Fluent API with method chaining
const result = document
  .withTitle("New Title")
  .withMetadata({ author: "John" })
  .toMarkdown()

// Avoid: Imperative style with mutations
document.setTitle("New Title")
document.setMetadata({ author: "John" })
const result = document.getMarkdown()
```

## Service Layer & Facade Patterns

- **Centralized Coordination**: Coordinate multiple domain objects and external resources
- **Unified Interface**: Hide complexity of subsystem interactions behind simple methods
- **Resource Management**: Handle I/O, validation, and cross-cutting concerns

```ts
// Service Layer: Coordinates domain operations
export class DocumentService {
  constructor(
    private readonly fileSystem: FileSystem,
    private readonly parser: ContentParser,
    private readonly validator: SchemaValidator
  ) {}

  async getDocument(path: string): Promise<Document> {
    // Facade: Single method hides multiple subsystem calls
    const content = await this.fileSystem.readFile(path)
    const parsed = this.parser.parseContent(content)
    const schema = await this.getSchemaForPath(path)
    const validated = this.validator.applyDefaults(parsed, schema)
    return new Document(validated)
  }
}
```

## Refactoring Decision Rules

- **Extract to domain method**: When logic appears in 2+ places
- **Create fluent method**: When manual object manipulation is required
- **Use Service Layer**: When coordinating 3+ related operations
- **Method naming**: `with*()` for transformations, `to*()` for outputs, `get*()` for retrieval

```ts
// Good: Logic encapsulated in domain object
const updatedDocument = document.withProperties(newProperties)
const markdown = updatedDocument.toMarkdown()

// Avoid: Manual operations scattered in calling code
const merged = { ...document.properties, ...newProperties }
const formatted = formatMarkdown(merged, document.content)
```

## Error Handling

- **Service Boundaries**: Handle errors at Service level, not in domain objects
- **Input Validation**: Validate at public method entry points only
- **Consistent Patterns**: Use HTTPException for API boundaries, return null/undefined for missing data

```ts
// Good: Error handling at service level
export class DocumentService {
  async getDocument(path: string): Promise<Document> {
    const exists = await this.fileExists(path)
    if (!exists) {
      throw new HTTPException(404, { message: "File not found" })
    }
    return this.loadDocument(path)
  }
}

// Good: Domain objects focus on business logic
export class Document {
  withTitle(title: string): Document {
    // No error handling needed - pure transformation
    return new Document({ ...this.props, title })
  }
}
```

## Async Patterns

- **Consistent async/await**: Never mix with .then() chains
- **Concurrent Operations**: Use Promise.all for independent operations
- **Sequential Operations**: Use await for dependent operations

```ts
// Good: Concurrent independent operations
const [document, schema] = await Promise.all([
  service.getDocument(path),
  service.getSchema(directoryPath)
])

// Good: Sequential dependent operations
const document = await service.getDocument(path)
const updated = document.withContent(newContent)
const saved = await service.saveDocument(updated)
```

## Testing Considerations

- **Pure Functions**: Prefer functions that are easy to test in isolation
- **Dependency Injection**: Use constructor injection for testable dependencies
- **Immutable Objects**: Make testing predictable with immutable state

```ts
// Good: Testable with dependency injection
export class DocumentService {
  constructor(
    private readonly fileSystem: FileSystem,
    private readonly parser: ContentParser
  ) {}
}

// Good: Pure, testable transformation
export class Document {
  withTitle(title: string): Document {
    return new Document({ ...this.props, title })
  }
}
```

## Naming and Typing

- Use descriptive naming conventions
- Do NOT abbreviate variable names
- Avoid any type
- Use "type" instead of "interface"
- No type assertion using "as"
- Do NOT use enum

## Functions

- When multiple arguments are needed, use an object named "props" with a defined "Props" type
- Prefer pure functions
- Use immutable data structures
- Isolate side effects
- Ensure type safety

```ts
type Props = {}

/**
 * Class Name
 */
export function FunctionName(props: Props) {
  // props.prop1 // Use props directly
  // const { prop1, prop2 } = props // Do NOT use destructuring
}
```

## Control Flow

- Use for-of loops instead of forEach
- Avoid if-else statements
- Use early returns instead of nested if statements
- Do NOT Use destructuring

## Variables and State

- Use const whenever possible, avoid let and var
- Do NOT use delete operator

## Classes

- Do NOT define classes with only static members
- Avoid class inheritance
- Make classes immutable

```ts
type Props = {}

/**
 * Class Name
 */
export class ClassName {
  constructor(private readonly props: Props) {}

  /**
   * Public method description
   */
  public method() {
    // method implementation
  }
}
```

## Comments

- Add comments only when function behavior is not easily predictable
- Do NOT use param or return annotations

## React

- Use TailwindCSS
- Use shadcn/ui
- Do NOT use useMemo or useCallback

## TailwindCSS

- Use `space-` or `gap-` instead of `pb-`

# `system/routes/*.ts` - System Directory

バックエンドに関するディレクトリです。

- try-catchを使用しない
- 例外では`HTTPException`をthrowする

```ts
export const GET = factory.createHandlers(async (c) => {
  const path = c.req.param("path")

  if (path === undefined) {
    throw new HTTPException(400, {})
  }

  return c.json({})
}
```

