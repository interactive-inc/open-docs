---
name: ""
purpose: ""
attributes: []
business_rules: []
---

# FieldType

スキーマフィールドのデータ型を表す値オブジェクト。

## 属性

### value

フィールドタイプ名。

- 事前定義された文字列値
- 大文字小文字を区別しない（内部的に小文字に正規化）

## ビジネスルール

- 以下の値のみ許可される
  - 基本型: string, number, boolean, date
  - 複数型: multi-string, multi-number, multi-boolean
  - 選択型: select-string, select-number
  - リレーション型: relation, multi-relation
- 空文字列は許可されない
- 不明な型名は例外をスローする
- 型に応じたデフォルト値とバリデーションルールが自動適用される
- 配列型（multi-*）は空配列をデフォルト値とする
- リレーション型はpathフィールドが必須となる
