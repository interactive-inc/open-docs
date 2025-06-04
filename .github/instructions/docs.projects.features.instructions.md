---
applyTo: "**/docs/projects/**/features/*.md"
---

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
