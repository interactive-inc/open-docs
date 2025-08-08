---
icon: 📄
schema:
  is-done:
    type: boolean
    title: 完了
---

# 機能

Open Docs クライアントアプリケーションの機能要件を定義するディレクトリです。

各機能は利用シナリオと実装の詳細を含み、マイルストーンと優先度で管理されます。

## 機能一覧

- [view-document-list.md](./view-document-list.md) - ドキュメント一覧を表示する
- [edit-document-metadata.md](./edit-document-metadata.md) - ドキュメントのメタデータを編集する
- [create-document.md](./create-document.md) - ドキュメントを作成する
- [delete-document.md](./delete-document.md) - ドキュメントを削除する
- [view-document-content.md](./view-document-content.md) - ドキュメントの内容を表示する
- [edit-document-content.md](./edit-document-content.md) - ドキュメントの内容を編集する
- [manage-relations.md](./manage-relations.md) - ドキュメント間のリレーションを管理する
- [manage-schema.md](./manage-schema.md) - ディレクトリスキーマを管理する

## 機能分類

### コア機能（高優先度）
ドキュメントの基本的なCRUD操作とコンテンツ編集

### 拡張機能（中優先度）
メタデータ編集、リレーション管理、テーブルビュー

### 管理機能（低優先度）
スキーマ管理、バリデーション設定