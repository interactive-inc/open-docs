---
title: 機能
schema:
  milestone:
    type: string
    required: false
    description: マイルストーン（例：2028.01.01）
  is-done:
    type: boolean
    required: false
    description: 完了フラグ
  priority:
    type: number
    required: false
    description: 優先度（0-100）
---

# features

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
