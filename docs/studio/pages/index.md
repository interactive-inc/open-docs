---
icon: 🏠
schema:
  features:
    type: multi-relation
    required: false
    title: 機能
    description: ページに関連する機能の一覧
    path: products/studio/features
---

# Open Docs Pages

Open Docs クライアントアプリケーションのページ仕様を定義するディレクトリです。

## ページ一覧

- [directory-browser.md](./directory-browser.md) - ディレクトリブラウザページ
- [document-editor.md](./document-editor.md) - ドキュメントエディタページ
- [schema-manager.md](./schema-manager.md) - スキーマ管理ページ
- [relation-viewer.md](./relation-viewer.md) - リレーション可視化ページ

## 共通UI要素

- **ナビゲーションヘッダー**: アプリケーション全体で共通のヘッダー
- **サイドバー**: ディレクトリツリーとナビゲーション
- **ステータスバー**: 現在の状態や進捗の表示
- **モーダルダイアログ**: 確認や設定のためのオーバーレイ

## UX原則

- **一貫性**: 全ページで統一されたデザインパターン
- **レスポンシブ**: モバイル・タブレット・デスクトップ対応
- **アクセシビリティ**: キーボード操作とスクリーンリーダー対応
- **パフォーマンス**: 大量データでも快適な操作性