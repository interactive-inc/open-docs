---
icon: 💎
schema:
  name:
    type: string
    required: true
    title: 値オブジェクト名
    description: 値オブジェクトの名前
  purpose:
    type: string
    title: 目的
    description: 値オブジェクトの役割と目的
  attributes:
    type: multi-string
    title: 属性一覧
    description: 値オブジェクトが持つ属性の一覧
  business_rules:
    type: multi-string
    title: ビジネスルール
    description: 値オブジェクトに適用されるビジネスルール
---

# Values

Open Docs システムの値オブジェクト定義を管理するディレクトリです。

値オブジェクトは、不変で軽量なデータ構造を表現し、ドメイン固有の概念を型安全に扱うために使用されます。

## 値オブジェクト一覧

- [document-path-value.md](./document-path-value.md) - ドキュメントパス値
- [field-type-value.md](./field-type-value.md) - フィールドタイプ値
- [frontmatter-value.md](./frontmatter-value.md) - フロントマター値
- [validation-rule-value.md](./validation-rule-value.md) - バリデーションルール値

## 値オブジェクト設計指針

- 不変性を保つ
- 値の等価性で比較する
- ビジネスルールを内包する
- 軽量で高パフォーマンス
- ドメイン固有の概念を明確に表現する
