---
icon: 🏗️
schema:
  name:
    type: string
    required: true
    title: エンティティ名
    description: エンティティの名前
  purpose:
    type: string
    title: 目的
    description: エンティティの役割と目的
  attributes:
    type: multi-string
    title: 属性一覧
    description: エンティティが持つ属性の一覧
  business_rules:
    type: multi-string
    title: ビジネスルール
    description: エンティティに適用されるビジネスルール
---

# Entities

Open Docs システムのエンティティ定義を管理するディレクトリです。

エンティティは、システムの中核となるデータモデルを表現し、ビジネスロジックとデータ構造を定義します。

## エンティティ一覧

- [document-entity.md](./document-entity.md) - ドキュメントエンティティ
- [directory-entity.md](./directory-entity.md) - ディレクトリエンティティ  
- [schema-entity.md](./schema-entity.md) - スキーマエンティティ
- [field-definition-entity.md](./field-definition-entity.md) - フィールド定義エンティティ

## エンティティ設計指針

- 単一責任の原則に従う
- ビジネスルールを明確に定義する
- 不変オブジェクトとして設計する
- 値オブジェクトと適切に分離する
- ドメイン固有の概念を正確に表現する