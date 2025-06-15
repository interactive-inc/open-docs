---
icon: 🏢
schema:
  milestone:
    type: relation
    required: false
    title: マイルストーン
    description: 開発のマイルストーン
    default: null
    path: products/client/milestones
  is-done:
    type: boolean
    required: false
    title: 完了フラグ
    description: 機能の実装が完了したかどうか
    default: false
  priority:
    type: number
    required: false
    title: 優先度
    description: 実装の優先順位（0が最低）
    default: 0
---

# 機能

このディレクトリには、在庫管理システムの各機能要件を定義するファイルが含まれています。

## ファイル一覧

- [add-inventory.md]() - 入庫処理を行う
- [create-product.md]() - 商品を新規登録する
- [delete-product.md]() - 商品を削除する
- [list-inventory.md]() - 在庫一覧を表示する
- [list-products.md]() - 商品一覧を表示する
- [move-inventory.md]() - 在庫移動を行う
- [remove-inventory.md]() - 出庫処理を行う
- [update-product.md]() - 商品情報を更新する
